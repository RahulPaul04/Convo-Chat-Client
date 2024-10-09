import React, {useEffect, useRef, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './chat.css'
import ChatName from '../components/ChatName'
import ChatWindow from '../components/ChatWindow'
import {Socket, io} from 'socket.io-client'
import newchatimg from '../images/newchat.png'
import emptyprofile from '../images/emptyprofile.png'
import backbutton from '../images/backbutton.png'
import closeicon from '../images/close.png'
import SERVER_URL from '../server_url'

function Chat() {

  const navigate = useNavigate()
  const [chatnames,setchatnames] = useState([]) //All the chat users
  const [chatuserhash,setchatuserhash] = useState({}) //Contains info of the user the current user has had chat with, info like name and profilephoto
  const [currentnames,setcurrentnames] = useState([]) //State contains the users that are currently displayed on the screen this changes when the search string changes
  const [searchstring,setsearchstring] = useState("") //State for the string in search Box
  const [slen,setslen] = useState(0)
  const [selectindex,setselectindex] = useState(null) // Index of current Open Chat
  const [socket,setsocket] = useState(null)
  const [messageArray,setmessageArray] = useState([])
  const [messagehashs,setmessagehashs] = useState({}) // Hash table for quickly accessing messages using their Id
  
  // For Adding New User Chat
  const [newchat,setnewchat] = useState(false)
  const [newchatstring,setnewchatstring] = useState("")
  const [newchaterror, setnewchaterror] = useState("")

  const [chatuserstatus,setchatuserstatus] = useState({})
  const [profilephoto,setprofilephotot] = useState("")

  // For Dynamic Screen Size
  const [ismobile,setismobile] = useState(window.innerWidth < 800)
  // const [ismedium,setismedium] = useState(window.innerWidth < 800)
  const [sidepanel,setsidepanel] = useState(true)

  // Creating References to use States when mounting socket
  const msghashref = useRef(messagehashs)
  const messagearrayref = useRef(messageArray)
  const chatnamesref = useRef(chatnames)
  const currentnamesref = useRef(currentnames)
  const chatuserhashref = useRef(chatuserhash)
  const chatuserstatusref = useRef(chatuserstatus)

  // Logout Warning State
  const [logoutwarning,setlogoutwarning] = useState(false)

  console.log("chatnames",chatnames);
  console.log("currentnames",currentnames);
  console.log("selectindex",selectindex);


  const errmsgs = {
    0:"placeholder",
    404:"User Does Not Exist",
  }



  
  useEffect(()=>{
    const user = localStorage.getItem('currentuser')
    const token = localStorage.getItem('token')

    if(!user || ! token){
      navigate('/')
    }
    else{
      fetchUserData(user,token)
      
    }

    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Socket disconnected");
      }
    }


  },[])


  useEffect(() => {
    msghashref.current = messagehashs 
    messagearrayref.current = messageArray
  },[messageArray])

  useEffect(() => {
    chatnamesref.current = chatnames
    currentnamesref.current = currentnames
  },[chatnames])

  useEffect(() => {
    chatuserhashref.current = chatuserhash
  },[chatuserhash])

  useEffect(() => {
    chatuserstatusref.current = chatuserstatus
  },[chatuserstatus])


  const setSocketListners = (socket) =>{

    socket.on('connect_error', (err) => {
      console.error('Connection Error:', err.message);
      
    });

    // socket.on('serverack',)

    socket.on('message',(msg) => {
      console.log("new message received",msg);
      let msgid = msg._id
      let messagearray = messagearrayref.current
      setmessageArray([...messagearray,msg])
      let hashset = msghashref.current
      hashset[msgid] = messageArray.length
      setmessagehashs({...hashset})

      let chatnames = chatnamesref.current
      let currentnames = currentnamesref.current
      let chatuserhash = chatuserhashref.cuurent

      socket.emit('recipientack',[msgid],msg.sender)

      // If the sender of message is not in the chatuser array request to get details line name and profilephoto
      if(!(msg.sender in chatuserhash)){
        chatnames.push({_id : msg.sender,name:msg.senderName})
        chatuserhash[msg.sender] = chatnames.length - 1
        socket.emit('newchatuser',localStorage.getItem('currentuser')._id,msg.sender)
      }


    })

    socket.on('serverack',(msgid)=>{
      // let msgindex = messagehashs[msgid]
      // console.log(messagehashs,"inside here in the useeffect")
      // delete messageArray[msgindex].notsent
      console.log("hashref",msghashref);
      let hashset = {...msghashref.current}
      let msgindex = hashset[msgid]
      // console.log(hashset);
      console.log(msgid);
      console.log(msgindex);
      let messageArray = messagearrayref.current
      console.log("serverack for ",messageArray[msgindex]);
      delete messageArray[msgindex].notsent
      setmessageArray([...messageArray])
    })

    socket.on('recipientack',(msgids)=>{
      console.log("Received recipient for message Id: ",msgids);
      let hashset = {...msghashref.current}
      
      let messageArray = messagearrayref.current
      for(let i = 0;i < msgids.length;i++){
        let msgindex = hashset[msgids[i]]
        messageArray[msgindex].delivered = true
      }
      setmessageArray([...messageArray])
    })

    socket.on('seenack',(msgids)=>{
      console.log("Received seenack for message Ids: ",msgids);
      let hashset = {...msghashref.current}
      
      let messageArray = messagearrayref.current
      for(let i = 0;i < msgids.length;i++){
        let msgindex = hashset[msgids[i]]
        messageArray[msgindex].seen = true
      }
      setmessageArray([...messageArray])
    })

    socket.on('statusupdate',(status) => {
      console.log("new status update received");
      console.log(status,'status update');
      console.log(status.lastseen);
      const userid = status.id
      let userstatus = {...chatuserstatusref.current}
      if(status.online == true){
        userstatus[userid] = "online"
      }
      else if (status.lastseen != null){
        let utcdate = new Date(status.lastseen)
        const localdatetime = utcdate.toLocaleString()
        let lastseen = "lastseen " + localdatetime
        let lstr = lastseen.split(' ')
        let time = lstr[2].split(':')
        let localtime = time[0] + ":"+time[1]
        let fulldate = lstr[0] + " " + lstr[1] + " " + localtime + " "+ lstr[3]
        userstatus[userid] = fulldate
      }
      console.log(userstatus);
      setchatuserstatus({...userstatus})
    })

    socket.on('profilephotoupdate',(update) => {
      let id = update._id
      let profilephoto = update.profilephoto
      let chatnameshash = chatuserhashref.current
      let chatnames = chatnamesref.current
      let currentnames  = currentnamesref.current
      let index = chatnameshash[id]
      console.log(chatuserhashref.current,chatnames,index,chatnames[index]);
      chatnames[index].profilephoto = profilephoto
      
      setchatnames([...chatnames])
      setcurrentnames([...currentnames])
      setchatuserhash({...chatnameshash})
    })


    socket.on('edit',(nmsg,msgid) => {
      console.log("editing message",nmsg,msgid);
      let hashset = {...msghashref.current}
      let msgindex = hashset[msgid]
      console.log(msgindex);
      let messageArray = messagearrayref.current
      messageArray[msgindex].content = nmsg
      messageArray[msgindex].edited = true
      setmessageArray([...messageArray])

    })

    socket.on('delete',(msgid) => {
      let hashset = {...msghashref.current}
      let msgindex = hashset[msgid]
      let messageArray = messagearrayref.current
      messageArray[msgindex].content = "This message has been deleted"
      messageArray[msgindex].deleted = true
      setmessageArray([...messageArray])
    })

  }

  
  

  const initialcalcs =  (user,messagearray,chatnames,socket) => {
      console.log("-------------------initial calcs--------------------------------");
      console.log(chatnames);
      let namehash = {}
      for(let i = 0;i<chatnames.length;i++){
        namehash[chatnames[i]._id] = {name:chatnames[i].name,profilephoto:chatnames[i].profilephoto}
      }

      //namehash contains all name and profile photo of users that the current user have previously chat with

      let chatusers = []
      let chatuserhash = {}
      let messagehashs = {}
      let userstatus = {}
      for(let i = 0;i<messagearray.length;i++){

        messagehashs[messagearray[i]._id] = i 
        let msg = messagearray[i]
        console.log("message sender",msg.sender,user._id);
        let chatuser = msg.sender == user._id?{_id : msg.recipient,name:msg.recipientName}:{_id : msg.sender,name:msg.senderName}
        if(!(chatuser._id in chatuserhash)){
          console.log("namehash",namehash,chatuser._id,namehash[chatuser._id],typeof namehash[chatuser._id]);
          if(chatuser._id == user._id){
            chatuser.profilephoto = user.profilephoto
          }
          //If the Message was sent to current user while the user was offline then the array from the databse wont have the data name and profile photo to be displayed then we would need to request the server to provide the name and profile photo for this user
          else {
            if(chatuser._id in namehash){
              chatuser.profilephoto = namehash[chatuser._id].profilephoto
            }
            else{
              socket.emit('newchatuser',localStorage.getItem('currentuser')._id,chatuser._id)
            }
          }
          chatusers.push(chatuser)
          chatuserhash[chatuser._id] = i
          userstatus[chatuser._id] = null //No User status Data available now will collect from Server when needed
        }
      }

      console.log('chatuserdata',chatusers);

      setmessagehashs(messagehashs)
      setchatnames(chatusers)
      setchatuserhash(chatuserhash)
      setcurrentnames(chatusers)
      setchatuserstatus(userstatus)

      console.log("-------------------------------------End initial calcs---------------------------");
  }

  const fetchUserData = async (user,token) => {
    try{
      let userdata = JSON.parse(user)
      const response = await axios.get(`${SERVER_URL}/chat/${userdata._id}`,{
        headers:{
          'Authorization':`Bearer ${token}`
        }
      })
      // setchatnames(response.data.chatusers)
      // setcurrentnames(response.data.chatusers)  
      setmessageArray(response.data.messagearray)

      const socket = io(`${SERVER_URL}`,{
        query:
        {
          userId:userdata._id,
          token:token
        },
        transports: ['websocket'] 
        
      })

      console.log("profilephotdata",response.data.chatusers);

      console.log("profilephote from server",response.data.user.profilephoto);

      setprofilephotot(response.data.user.
        profilephoto
        )
      setsocket(socket)
      setSocketListners(socket)
      initialcalcs(userdata,response.data.messagearray,response.data.chatusers,socket)
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    let sstring = searchstring.trim()
    setslen(sstring.length)
    if(sstring != ""){
      let snames = chatnames.filter((name)=>name.name.toLowerCase().startsWith(sstring.toLowerCase()))
      setcurrentnames(snames)
    }
    else{
      setcurrentnames(chatnames)
    }
  },[searchstring])

  const handlechange = (index)=>{
    setselectindex(index)
    setsidepanel(false)
  }

  const searchuser = async () => {
    
    try {
      console.log(newchatstring);
      const response = await axios.get(`${SERVER_URL}/search/${newchatstring}`)
      const user = response.data.user
      console.log(!(user._id in chatuserhash),"is it true");
      if(user && !(user._id in chatuserhash)){
        console.log("in here new chat");
        setchatnames([...chatnames,user])
        setcurrentnames([...chatnames,user])
        
        let hashset = {...chatuserhash}
        hashset[user._id] = chatnames.length 
        setchatuserhash({...hashset})
        console.log("length of chatnames",chatnames.length);
        setselectindex(chatnames.length)
        const currentuser = JSON.parse(localStorage.getItem('currentuser'))
        console.log(currentuser,currentuser['_id'],"sending for new user");
        socket.emit('newchatuser',currentuser._id,user._id)
        newchatclose()
      }

    }
    catch(err){
      if(err.response){
        setnewchaterror(err.response.status)
      }
    }


  }

  const newchatclose = () => {
    setnewchat("")
    setnewchatstring("")
    setnewchaterror("")
  }

  const changeval = (val) => {
    setnewchaterror("")
    setnewchatstring(val)
  }

  const logout = () => {

    if(socket) {
      socket.disconnect()
    }

    localStorage.removeItem('currentuser')
    localStorage.removeItem('token')

    navigate('/')
  }

  console.log(profilephoto,"profilephoto");

  useEffect(() => {
    const handleResize = () => {
      // setismedium(window.innerWidth < 800 && window.innerWidth >= 576)
      setismobile(window.innerWidth < 800)
    }

    window.addEventListener('resize',handleResize)

    return () => {
      window.removeEventListener('resize',handleResize)
    }
  },[])


  return (
    <div className='d-flex full-container'>
      {logoutwarning && (
        <div className='logout-container'>
          <div className="logout-warning p-4">
            <p style={{color:'white'}} className='fs-4'>Are You Sure You Want To Logout ?</p>
            <div className='d-flex justify-content-end gap-2'>
              <div style={{color:'#00a884', border:'solid #00a884 1px'}} className="btn" onClick={(e)=>setlogoutwarning(false)}>Cancel</div>
              <div className="btn btn-danger" onClick={logout}>Logout</div>
            </div>
          </div>
        </div>
      )}
      <div
          className="names"
          style={
            ismobile?
              (sidepanel
                ?{width:'100%'}
                :{width:'0px'})
              : { width: '400px' }
          }
        >
          <div className="header-name d-flex align-items-center ps-2 pe-2 pt-1 pb-1 justify-content-between" 
          style={
            ismobile?
              (sidepanel
                ?{width:'100%'}
                :{width:'0px'})
              : { width: '400px' }
          }>
              <div className="profile-photo" style={{height:'100%'}}>
                <img className='img-fluid ' style={{height:'90%',borderRadius:'50%'}} src={profilephoto?`${SERVER_URL}/profileimgs/${profilephoto}`:emptyprofile} alt="" />
              </div>
              <div className="actions d-flex justify-content-end gap-2" >
                  <div style={{cursor:'pointer'}} className="new-chat-toggle" onClick={(e) => setnewchat(true)}>
                    <img src={newchatimg} alt="" />
                  </div>
                  <div style={{cursor:'pointer'}} className="close-button" onClick={(e)=>setlogoutwarning(true)}>
                    <img height={24} src={closeicon} alt="" />
                  </div>
              </div>
          </div>
          <div className="search m-2">
            <input value={searchstring} onChange={(e)=>setsearchstring(e.target.value)} type="text" placeholder='Search' className='w-100 p-2'   />
          </div>
          <div className="chat-names" >
            <div className="new-chat d-flex flex-column" style={{width:`${newchat?'100%':'0'}`}}>
              <div onClick={newchatclose} className='ms-2 mt-2' style={{cursor:'pointer', display:`${newchat?'block':'none'}`}}>
                <img src={backbutton} alt="" />
              </div>

              <div className='newchat-input d-flex flex-column justify-content-center align-items-center'>
                <div style={{color:'red',display:`${newchat?'block':'none'}`}} className='newchaterr'>{errmsgs[newchaterror]}</div>
                <div style={{display:`${newchat?'block':'none'}`} }className="newchatinput m-2 ">
                    <input value={newchatstring} onChange={(e)=>changeval(e.target.value)} type="text" placeholder='Enter E-mail' className='w-100 p-2'   />
                </div>
                <div>
                  <div onClick={searchuser} style={{display:`${newchat?'block':'none'}`}} className="btn ps-3 pe-3 mt-2 add-chat">Chat</div>
                </div>
              </div>

            </div>
            {
              currentnames && currentnames.map((name,index)=>{
                return <ChatName selected ={selectindex == index}  name={name.name} key={index} index={index} slen={slen} onclick={handlechange} profilephoto={name.profilephoto}/>
              })
              
            }
          </div>
      </div>
      <div className="chat">
            {selectindex != null && <ChatWindow id={chatnames[selectindex]._id} name={chatnames[selectindex].name} socket={socket} messageArray={messageArray} setmessageArray={setmessageArray} messagehashs={messagehashs} setmessagehashs={setmessagehashs} chatuserstatus={chatuserstatus} setchatuserstatus={setchatuserstatus} profilephoto={chatnames[selectindex].profilephoto} setsidepanel={setsidepanel} ismobile={ismobile}/>}
      </div>

    </div>
  )
}

export default Chat