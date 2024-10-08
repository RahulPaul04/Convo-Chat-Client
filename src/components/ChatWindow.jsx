import React, { useState,useRef, useEffect } from 'react'
import emptyprofile from '../images/emptyprofile.png'
import './chatwindow.css'
import sendicon from '../images/newmsg.png'
import {v4 as uuidv4} from 'uuid'
import deliverdtick from '../images/New Text Document5.png'
import singletick from '../images/singletick.png'
import bluetick from '../images/New Text Document (2).png'
import dropdown from '../images/Dropdown.png'
import cancel from '../images/cancel (1).png'
import hamburgericon from '../images/burger-menu-svgrepo-com.png'

function ChatWindow({id,name,socket,messageArray,setmessageArray,messagehashs, setmessagehashs, chatuserstatus,setchatuserstatus,profilephoto,setsidepanel,ismobile}) {

    console.log("name in chatwondow",name);
    const [message,setmessage] = useState("")
    const [recpid,setrecpid] = useState(id)
    const [dropdownindex,setdropdownindex] = useState(null)
    const [editwindow,seteditwindow] = useState(false)
    const [editmsg,seteditmsg] = useState("")
    const [editmessage,seteditmessage] = useState("")
    
    
    console.log("messagearray",messageArray);

    let user= JSON.parse(localStorage.getItem('currentuser'))

    const messageEndRef = useRef(null)
    let recipientackarray = []


    const sendMessage = () =>{
        if(message.trim() != ""){

            const  msgid = uuidv4()
            console.log(msgid);

            const msg = {
                _id:msgid,
                content:message,
                sender:user._id,
                recipient:id,
                senderName:user.name,
                recipientName:name,
                notsent:true,
                timestamp:new Date()
            }
            if(msg.sender == msg.recipient){
                msg.delivered = true
                msg.seen = true
                delete msg.notsent
            }
            
            setmessageArray([...messageArray,msg])
            setmessage("")
            let hashset = {...messagehashs}
            hashset[msgid] = messageArray.length 
            console.log("array length",messageArray.length,hashset[msgid],hashset,"hashset here");
            setmessagehashs({...hashset})
            const sentmsg = {...msg}
            delete sentmsg.notsent //Message will have key notsent as true until server ack is received but we don't need to send this key to server
            socket.emit('message', sentmsg)
        }
    }

    

    //Will send Seen Ack for all the messages disaplayed to user
    useEffect(() => {
        if(recipientackarray.length > 0){
            console.log("sending seen ack to sender",recipientackarray);
            socket.emit('seenack',recipientackarray,id)
        }
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({behavior:'smooth'})
        }
        recipientackarray = []
        
    },[messageArray])

    // Send request for Status update if not available
    useEffect(() => {
        console.log('sending request for status update');
        if(!(chatuserstatus[id])){
            socket.emit('getuserstatus',id)
        }
    },[id])

    console.log(chatuserstatus[id],"chatuserstatus",chatuserstatus);

    const toogleDropDown = (index) =>{
        if(dropdownindex == index){
            setdropdownindex(null)
        }
        else{
            setdropdownindex(index)
        }
    }

    const updatemsg = (msg) => {
        setdropdownindex(null)
        seteditmsg(msg.content)
        setmessage(msg.content)
        seteditwindow(true)
        seteditmessage(msg)
    }

    const deletemsg = (msg) => {
        setdropdownindex(null)
        socket.emit("deletemsg",msg)
        let msgarr = [...messageArray]
        let msgid = msg._id
        let msgindex = messagehashs[msgid]
        let message = msgarr[msgindex]
        message.content = "This Message has been deleted"
        message.deleted = true
        setmessageArray([...msgarr])
    }

    const canceledit = () => {
        seteditmsg("")
        seteditwindow(false)
        setmessage("")

    }

    const sendedit = () => {
        socket.emit("editmsg",message,editmessage)
        seteditmessage("")
        setmessage("")
        seteditwindow(false)
        seteditmsg("")
        let msgarr = [...messageArray]
        let msgid = editmessage._id
        let msgindex = messagehashs[msgid]
        let msg = msgarr[msgindex]
        msg.content = message
        msg.edited = true
        setmessageArray([...msgarr])
    }

    const tolocaltime = (utctime) => {

        let utcdate = new Date(utctime)
        const localdatetime = utcdate.toLocaleString()
        let lastseen =  localdatetime
        let lstr = lastseen.split(' ')
        let time = lstr[1].split(':')
        let localtime = time[0] + ":"+time[1]
        let fulldate = lstr[0] + " " +   " " + localtime + " "+ lstr[2]
        return fulldate
    }

    const comparedate = (current,prev) => {
        if (!current.timestamp && !prev){
            return false
        }
        if (!current.timestamp){
            return false
        }
        let currdate = new Date(current.timestamp)
        const currlocaldatetime = currdate.toLocaleString()
        if (!prev) {
            return currdate
        }
        let prevdate = new Date(prev.timestamp)
        const prevlocaldatetime = prevdate.toLocaleString()
        currdate = currlocaldatetime.split(' ')[0]
        prevdate = prevlocaldatetime.split(' ')[0]
        console.log("checking date",prevdate,currdate);
        if (currdate != prevdate){
            
            return currdate.split(',')[0]
        }
        else{
            return false
        }
    }

  return (
    <div className='w-100 d-flex flex-column' style={{height:'100vh'}}>
        {editwindow && <div className='editwindow d-flex flex-column align-items-center justify-content-center'>
        <div className='w-100 w-md-50'style={{backgroundImage:'background-image: url( "https://wallpapercave.com/wp/wp6988787.png")'}} >
                <div onClick={canceledit} className='canceledit mb-4' style={{marginLeft:'auto',marginRight:'20px',width: 'fit-content',cursor:'pointer'}}>
                    <img src={cancel} alt="" />
                </div>
                <div className="prevmsg message sender">
                    
                            
        
                    <p style={{marginBottom:'0'}}>{editmsg}</p>
    
                </div >
                <div className="w-100 msg-input d-flex  align-items-center rounded">
                    
                    <div className='input ms-2'>
                        <input onChange={(e)=>setmessage(e.target.value)} value={message} className='ps-2 pe-2 w-100' placeholder='Type a Message' type="text" />
                    </div>
                    <div onClick={sendedit} className="send-icon ms-3 me-3">
                        <img  className='img-fluid' src={sendicon} alt="" />
                    </div>
                </div>
        </div>
            </div>}
        <div className="d-flex header-chat w-100 align-items-center justify-content-between" >
            
                <div className='d-flex align-items-center'>
                    <img height={'60px'} style={{borderRadius:'50%'}} src={profilephoto?`http://localhost:3000/profileimgs/${profilephoto}`:emptyprofile} alt="" className=" m-2" />
                    <div className='d-flex flex-column align-items-center'>
                        <div className='name2'> 
                        
                                {name}
                            
                        </div>
                        <div className="status" style={{color:'rgba(233,237,239,0.5)',fontSize:'14px',paddingLeft:'10px'}}>
                            {chatuserstatus[id]}
                        </div>
                    </div>
                </div>
                {ismobile && <div className="backbutton me-2" style={{cursor:'pointer'}} onClick={(e) => setsidepanel(true)}>
                    <img className='img-fluid' style={{width:'30px'}} src={hamburgericon} alt="" />
                </div>}
            
           
        </div>
        <div className="msg-window w-100 pt-3 pb-3">
            {
                // Fill Seen Ack array while iterating to Display Messages
                messageArray.map((msg,index) => {
                    if(msg.sender == id && msg.sender != user._id && !(msg.seen) ){
                        recipientackarray.push(msg._id)
                    }
                    console.log(id == user._id);
                    return(id == user._id)?(
        
                        (msg.sender == msg.recipient) && <div key={index} className='message   sender'>
                        <p style={{marginBottom:'0'}}>{msg.content}</p>
                        <p className=' justify-content-end' style={{margin:'0',transitionDuration:'1s',fontSize:'10px',fontWeight:'900',display:`${msg.sender==user['_id']?'flex':'none'}`}}>{msg.notsent == true ?'. . .':msg.seen?<img  className='ms-auto img-fluid '  src={bluetick} alt="" />:msg.delivered?<img  className='ms-auto img-fluid '  src={deliverdtick} alt="" />:<img  className='ms-auto img-fluid '  src={singletick} alt="" />}</p>
                    </div>
                    ) :
                    <div>
                        {(msg.index == 0 || comparedate(msg,messageArray[index-1]))&&<div className='mx-auto d-flex justify-content-center ms-2 me-2'><p className='p-1' style={{color:'rgba(255,255,255,0.5)',backgroundColor:'#182229',borderRadius:'5px',width:'fit-Content'}}>{comparedate(msg,messageArray[index-1])}</p></div>}
                    
                    {(id == msg.recipient || id == msg.sender) &&  <div key={index} className={`message ${msg.sender == user._id?'sender':'received'}`} >
                        {msg.sender == user._id && <div className="dropdown" onClick={e=>toogleDropDown(index)}><img src={dropdown} alt="" /></div>}
                        {<div className='dropoptions' style={{maxHeight: `${dropdownindex == index?'100px':'0px'}`, overflow:'hidden',padding: dropdownindex === index ? '10px' : '0'}}>
                            <p onClick={e=>updatemsg(msg)}>Edit </p>
                            <p onClick={e => deletemsg(msg)}> Delete </p>
                            </div>}
 
                        <p className={msg.deleted? "deleted":undefined} style={{marginBottom:'0'}}>{msg.deleted && msg.sender == user._id?"You Deleted this Message":msg.content}</p>
                        <div className='message-footer d-flex gap-2 justify-content-end'>
                            {msg.edited && !msg.deleted && <p style={{fontSize:'10px',marginBottom:'0px',color:'rgba(255,255,255,0.7'}}>Edited</p>}
                            {msg.timestamp && !msg.deleted && <p style={{fontSize:'10px',marginBottom:'0px',color:'rgba(255,255,255,0.7'}}>{tolocaltime(msg.timestamp)}</p>}
                            {!msg.deleted && <p className=' align-items-center justify-content-end' style={{margin:'0',transitionDuration:'1s',fontSize:'10px',fontWeight:'900',display:`${msg.sender==user['_id']?'flex':'none'}`}}>{msg.notsent == true ?'. . .':msg.seen?<img  className='ms-auto img-fluid '  src={bluetick} alt="" />:msg.delivered?<img  className='ms-auto img-fluid '  src={deliverdtick} alt="" />:<img  className='ms-auto img-fluid '  src={singletick} alt="" />}</p>}
                        </div>
                       
                    </div>}
                    </div>
                })
            }
            <div ref={messageEndRef} />
            
        </div>
        <div className="msg-input d-flex  align-items-center">
            <div className='input ms-2'>
                <input onChange={(e)=>setmessage(e.target.value)} value={message} className='ps-2 pe-2 w-100' placeholder='Type a Message' type="text" />
            </div>
            <div onClick={sendMessage} className="send-icon ms-3 me-3">
                <img  className='img-fluid' src={sendicon} alt="" />
            </div>
        </div>
    </div>
  )
}

export default ChatWindow