import React, { useState,useRef } from 'react'
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './signup.css'
import axios from 'axios'
import { Link } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Fade from '@mui/material/Fade';
import Alert from '@mui/material/Alert';
import emptyprofile from '../images/emptyprofile.png'
import Cropper from 'react-easy-crop'
import tickimg from '../images/checkmark.png'
import SERVER_URL from '../server_url';





function Signup() {

    const [name,setname] = useState("")
    const [email,setemail] = useState("")
    const [password,setpassword] = useState('')
    const [cpassword,setcpassword] = useState("")
    const [profilephoto,setprofilephoto] = useState(null)
    const [profileimgurl,setprofileimgurl] = useState("")

    const [nameinvalid,setnameinvalid] = useState(false)
    const [emailinvalid,setemailinvalid] = useState(false)
    const [passnomatch,setpassnomatch] = useState(false)
    const [signuperror,setsignuperror] = useState(0)
    const [duplicateemail,setduplicateemail] = useState(false)
    const [emptypassword,setemptypassword] = useState(false)


    const [open,setopen] = useState(false)
    const [imagehovered,setimagehovered] = useState(false)
    const [cropareapixels,setcropareapixels] = useState(null)

    const fileInputRef = useRef(null)
    const canvasref = useRef(null)

    const [crop,setcrop] = useState({x:0, y:0})
    const [zoom,setzoom] = useState(1)
    const [showcropper,setshowCropper] = useState(false)
    const [croppedimage,setcroppedimage] = useState(null)
    const [croppedimageurl,setcroppedimageurl] = useState(null)


    //todo set empty password error

    let errormsg = {
        0:"",
        400:"E Mail Already Registerd. Plese Sign In",
        500:"Internal Server Error"
    }

    let errmsg = errormsg[signuperror]

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const nameset = (val)=>{
        setnameinvalid(false)
        setname(val)
    }

    const mailset = (val)=>{
        let match = email.match(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
        if(match){
            setemailinvalid(false)
        }
        setsignuperror(0)
        console.log("here");
        setemail(val)
    }

    const passset = (val)=>{
        setpassword(val)
        setemptypassword(false)
        if(val == cpassword){
            setpassnomatch(false)
        }
        if(signuperror != 400){
            setsignuperror(0)
        }
        
    }

    const cpassset = (val)=>{
        setcpassword(val)
        if(val == password){
            setpassnomatch(false)
        }
        
        if(signuperror != 400){
            setsignuperror(0)
        }
    }

    const verifyinput = ()=>{
        let match = email.match(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
        console.log("match",!match);
        if(!match){
            console.log("inside match")
            setemailinvalid(true)
        }

        if(name.trim() == ""){
            setnameinvalid(true)
        }

        if(password == ""){
            setemptypassword(true)
        }

        console.log(password,cpassword);

        if(password != cpassword){
            setpassnomatch(true)
        }

        if(match && password == cpassword && password != "" && name.trim() != ""){
            console.log("here checking",emailinvalid,passnomatch)
            console.log("registering user");
            registerUser()
        }
    }

    const registerUser = async () =>{
        
        const userData = {
            name:name,
            email:email,
            password:password
        }

        const formData = new FormData()
        formData.append('name',name.trim())
        formData.append('email',email)
        formData.append('password',password)
        if(profilephoto){
            formData.append('profilephoto',croppedimage)
        }

        try{
            await axios.post(`${SERVER_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
                },
            });
            console.log("user registration successfull");
            setopen(true)
            setname("")
            setemail("")
            setpassword('')
            setcpassword("")
            setprofilephoto(null)
            setprofileimgurl("")
            setcroppedimage(null)
            setcroppedimageurl("")

        }
        catch(err){
            
            if(err.response){
                console.log(err.response.status);
                console.log(err.response.data);
                setsignuperror(err.response.status)
            }
        }
    }

    const handleClose = ()=>{
        setopen(false)
    }

    const profilephotoupload = (e) => {
        let img = e.target.files[0]
        setprofilephoto(img)
        setprofileimgurl(URL.createObjectURL(img))
        setshowCropper(true)
    }

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
          }
      }

    const getCroppedImage = async (croppedAreaPixels) => {
        
        const canvas = canvasref.current
        const ctx = canvas.getContext('2d')

        const image = new Image()
        image.src = profileimgurl

        await new Promise((resolve) => {
            image.onload = resolve
        })

        const {width,height,x,y} = croppedAreaPixels
        canvas.width = width
        canvas.height = height

        ctx.drawImage(
            image,
            x,y,
            width,height,
            0,0,
            width,height
        )

        return new Promise ((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob],'profileimgcropped.jpg',{type:'image/jpeg'})
                const url = URL.createObjectURL(blob)
                resolve({file,url})
            }, 'image/jpeg')
        })
    }

    const selectimage = async () => {
        const croppedAreaPixels = cropareapixels
        console.log(croppedAreaPixels);
        const {file,url} = await getCroppedImage(croppedAreaPixels)
        setcroppedimage(file)
        setcroppedimageurl(url)
        setshowCropper(false)
    }


  return (
    
    <div className='d-flex flex-column justify-content-center align-items-center gap-3' style={{height:'100dvh',backgroundColor:' #121212'}}>
        {showcropper && (
            
                <div  style={{position:'absolute',height:'100%',width:'100%',zIndex:'4',backgroundColor:'rgba(0,0,0,0.6)'}}>
                    <div className='cropper-container' >
                        <Cropper
                        
                        image={profileimgurl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1/1}
                        onCropChange={setcrop}
                        onZoomChange={setzoom}
                        onCropComplete={(croppedArea, croppedAreaPixels) => setcropareapixels(croppedAreaPixels)}

                        />
                        <div onClick={selectimage} className="confirmimg">
                            <img height={28} src={tickimg} alt="" />
                        </div>
                    </div>
                    
                </div>
           
        )}
        <Snackbar
        anchorOrigin={{'vertical':'top','horizontal' :'center'}}
        open={open}
        onClose={handleClose}
        autoHideDuration={3000}
        TransitionComponent={Fade}
        

        
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
            User registered Successfully
        </Alert>
      </Snackbar>
      <canvas ref={canvasref} style={{ display: 'none' }}></canvas>
        <div className="signup-container d-flex flex-column gap-3 ps-2 pe-2">

       

        <p style={{opacity:`${signuperror?'1':'0'}`,color:'#ed4a68'}}>{errmsg}</p>
        <div className='d-flex justify-content-center '>
            
            <input
            style={{display:'none'}}
                id="file-input"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={profilephotoupload}
            />
            {croppedimageurl && (
                <div style={{position:'relative',cursor:'pointer'}} onClick={handleUploadClick} onMouseEnter={(e)=>setimagehovered(true)} onMouseLeave={(e)=>setimagehovered(false)}>
                    <img src={croppedimageurl} alt="Preview" style={{ borderRadius:'50%', width: '150px', height: '150px'}} />
                    <div className="overimage" style={{backgroundColor:`${imagehovered?'rgba(0,0,0,0.6)':'rgba(0,0,0,0)'}`,width:'150px',height:'150px',transitionDuration:'0.5s'}}>
                        
                    </div>
                    <div className="uploadtext" style={{display:`${imagehovered?'block':'none'}`}}>
                        <p>Change</p>
                        <p>Image</p>
                    </div>
                </div>
            )}
            {!croppedimageurl && (
                <div style={{position:'relative',cursor:'pointer'}} onClick={handleUploadClick} >
                    <img  src={emptyprofile} alt="Preview" style={{ width: '150px', height: 'auto' }} />
                    <div className="overimage">
                        
                    </div>
                    <div className="uploadtext">
                        <p>Upload</p>
                        <p>Image</p>
                    </div>
                
                </div>
            )}
            
        </div>

        <TextField onChange={(e)=>nameset(e.target.value)} id="name" label="Name" variant="outlined"
        value={name}
        error={nameinvalid}
        helperText={nameinvalid?"Name Required":""}
        
                
        InputProps={{
            style: {
              color: 'white', // Change text color
              
             // Text color
            }
            
          }}

        

          sx={{
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.67)' }, // Change label color
            '& .MuiInputLabel-root.Mui-focused': {
                color: '#198754', // Label color when focused
              },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.67)', // Change border color
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.87)', // Change border color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#198754', // Change border color when focused
              },
              '& input:-webkit-autofill': {
                WebkitBoxShadow:  '0 0 0px 1000px transparent inset',
                WebkitBackdropFilter:'rgba(0,0,0,0)',
                WebkitTextFillColor: 'rgba(255,255,255,0.87)', /* Customize the text color */
            },
              
            },
         }} />
        <TextField  onChange={(e)=>mailset(e.target.value)} id="Email" label="Email" variant="outlined" 
        value={email}
        error={emailinvalid}
        helperText={emailinvalid?'Invalid E-Mail':"    "}
        InputProps={{
            style: {
              color: 'white', // Change text color
            },
          }}

            sx={{
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.67)' }, // Change label color
            '& .MuiInputLabel-root.Mui-focused': {
                color: '#198754', // Label color when focused
              },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.67)', // Change border color
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.87)', // Change border color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#198754', // Change border color when focused
              },
              
            },
         }} />
        {/* <p className='warning' style={{color:'#ed4a68',opacity:`${emailinvalid?'1':'0'}`}} >Invalid E Mail</p> */}
        <FormControl variant="outlined">
                    <InputLabel 
                    InputProps={{
                        style: {
                          color: 'white', // Change text color
                        },
                      }}
                   
          sx={{
            color: 'rgba(255,255,255,0.67)', // Change label color
            '&.Mui-focused': {
              color: '#198754', // Label color when focused
            },
          }}

            
                    htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput 
                    error={emptypassword || passnomatch}
                    InputProps={{
                        style: {
                          color: 'white', // Change text color
                        },
                      }}
                        sx={{
                            color:'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.67)', 
                              // Change border color
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.87)', // Change border color on hover
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#198754', // Change border color when focused
                            },
                            '& .MuiInputAdornment-root': {
                                color: 'white', // Change color of the input adornment
                              },
                          }}
                    
                        id="outlined-adornment-password"
                        value={password}
                        type={showPassword ? 'text' : 'password'}
                        onChange={(e)=>passset(e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                
                                
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    sx={{ color: 'rgba(255,255,255,0.67)' }}
                                >
                                    {showPassword ? <Visibility/> : <VisibilityOff/>}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"

                        
                    />
                </FormControl>
        <TextField 
        error={emptypassword || passnomatch}
        helperText={emptypassword?"Password is empty":passnomatch?"Passwords Do Not Match":""}
         InputProps={{
            style: {
              color: 'white', // Change text color
            },
          }}

          sx={{
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.67)' }, // Change label color
            '& .MuiInputLabel-root.Mui-focused': {
                color: '#198754', // Label color when focused
              },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.67)', // Change border color
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.87)', // Change border color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#198754', // Change border color when focused
              },
              
            },
         }}

        
         onChange={(e)=>cpassset(e.target.value)} id="cpass" label="Confirm Passoword" variant="outlined" 
        value={cpassword} />
        {/* <p className='warning' style={{color:'#ed4a68',opacity:`${passnomatch?'1':'0'}`}} >Passwords Do Not Match</p> */}
        </div>
        <button style={{backgroundColor:'#198754',color:'rgba(255,255,255,0.87'}} onClick={verifyinput} className='btn '>Sign Up</button>
        <p style={{color:'rgba(255,255,255,0.87'}}>Already A User ? <Link style={{textDecoration:'none'}} to={'/'}> <span style={{color:'#198754',textDecoration:'none'}}>Log In</span></Link> </p>
    </div>
  )
}

export default Signup