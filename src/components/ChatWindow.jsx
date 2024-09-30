import React, { useState,useRef, useEffect } from 'react'
import emptyprofile from '../images/emptyprofile.png'
import './chatwindow.css'
import sendicon from '../images/newmsg.png'
import {v4 as uuidv4} from 'uuid'
import deliverdtick from '../images/New Text Document5.png'
import singletick from '../images/singletick.png'
import bluetick from '../images/New Text Document (2).png'

function ChatWindow({id,name,socket,messageArray,setmessageArray,messagehashs, setmessagehashs, chatuserstatus,setchatuserstatus,profilephoto}) {

    console.log("name in chatwondow",name);
    const [message,setmessage] = useState("")
    const [recpid,setrecpid] = useState(id)
    
    
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
                notsent:true
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
            delete sentmsg.notsent //Message will have key notsent as true until server ack is received but we don;t need to send this key to server
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

    
  return (
    <div className='w-100 d-flex flex-column' style={{height:'100vh'}}>
        <div className="d-flex header-chat w-100 align-items-center">
            
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
                    ) :(id == msg.recipient || id == msg.sender) &&  <div key={index} className={`message ${msg.sender == user._id?'sender':'received'}`} >
                        <p style={{marginBottom:'0'}}>{msg.content}</p>
                        <p className=' justify-content-end' style={{margin:'0',transitionDuration:'1s',fontSize:'10px',fontWeight:'900',display:`${msg.sender==user['_id']?'flex':'none'}`}}>{msg.notsent == true ?'. . .':msg.seen?<img  className='ms-auto img-fluid '  src={bluetick} alt="" />:msg.delivered?<img  className='ms-auto img-fluid '  src={deliverdtick} alt="" />:<img  className='ms-auto img-fluid '  src={singletick} alt="" />}</p>
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