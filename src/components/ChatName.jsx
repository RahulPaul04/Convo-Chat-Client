import React, { useState } from 'react'
import './chatname.css'
import profileimg from '../images/emptyprofile.png'

function ChatName({name,slen,index,selected,onclick,profilephoto}) {

    const [hovered,sethovered] = useState(false)
    let chatname = name

    

  return (
    <div  style={{backgroundColor:`${selected?'rgb(42 57 66) ':hovered?'#202c33':'rgba(0,0,0,0)'}`}} onClick={()=>onclick(index)} className='name-container d-flex'
    onMouseEnter={() => sethovered(true)}
    onMouseLeave={() => sethovered(false)}>
        <img className='img-fluid col-2 p-1' style={{borderRadius:'50%'}} src={profilephoto?`http://localhost:3000/profileimgs/${profilephoto}`:profileimg} alt="" />
        <p className='name col-10 d-flex align-items-center'>
            {
                chatname.split('').map((word,index)=>{
                    if(index<slen){
                        return <span key={index} style={{color:'#02a698'}}>{word}</span>
                    }
                    else{
                        return <span key={index} >{word}</span>
                    }
                })
            }
        </p>
    </div>
  )
}

export default ChatName