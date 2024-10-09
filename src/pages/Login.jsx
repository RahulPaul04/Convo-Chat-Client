import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import logo from '../images/logo.png'
import SERVER_URL from '../server_url';



function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email,setemail] = useState("")
    const [password,setpassword] = useState("")
    const [emailinvalid,setemailinvalid] = useState(false)
    const [passinvalid,setpassinvalid] = useState(false)
    const [errcode,seterrcode] = useState(0)
    const navigate = useNavigate()

    const errmsgs = {
        0:"placeholder ",
        404:"User Does Not Exist",
        401:"Incorrect UserName or Password"       
    }

    let errmsg = errmsgs[errcode]

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const mailset = (value) =>{
        setemailinvalid(false)
        setemail(value)
        seterrcode(0)
    }

    const passset = (val) =>{
        setpassinvalid(false)
        setpassword(val)
        seterrcode(0)
    }

    const verify = () => {
        
        let match = email.match(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
        console.log("match",!match);
        if(!match){
            console.log("inside match")
            setemailinvalid(true)
        }

        if(password == ""){
            setpassinvalid(true)
        }

        if(match && password != ""){
            loginUser()
        }

    }

    const loginUser = async () =>{

        const loginData = {
            email:email,
            password:password
        }

        try{
            console.log("before requesr");
            const res = await axios.post(`${SERVER_URL}/login`,loginData)
            console.log("here after response");
            console.log("response",res);
            const {currentuser,token} = res.data
            console.log(currentuser);
            localStorage.setItem('currentuser',JSON.stringify(currentuser))
            localStorage.setItem('token',token)
            navigate('/chat')
            
        }
        catch(err){
            if(err.response){
                seterrcode(err.response.status)
            }
        }
    }

    return (
        <div className='d-flex flex-column gap-3 justify-content-center align-items-center' style={{ height: "100dvh",backgroundColor:'#121212' }}>
            <div className='d-flex  flex-column gap-3 ' >
                <div className='text-center'>
                    <img style={{width:'200px'}} className='img-fluid' src={logo} alt="" />
                </div>
            <p className='warning mb-1' style={{opacity:`${errcode?'1':'0'}`}}>{errmsg}</p>

                <TextField onChange={(e)=>mailset(e.target.value)} id="Email" label="Email" variant="outlined"
                error={emailinvalid}
                
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
                 }}/>
                <p className='warning' style={{color:'red',opacity:`${emailinvalid?'1':'0'}`}} >Invalid E Mail</p>

                <FormControl variant="outlined">
                    <InputLabel 
                    
                    sx={{
                        color: 'rgba(255,255,255,0.67)', // Change label color
                        '&.Mui-focused': {
                          color: '#198754', // Label color when focused
                        },
                      }}
                    htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput

                    error={passinvalid}

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
                        onChange={(e)=>passset(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"

                                    sx={{ color: 'rgba(255,255,255,0.67)' }}
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>
                <p className='warning' style={{color:'red',opacity:`${passinvalid?'1':'0'}`}} >Please Enter Password</p>

                <button onClick={verify} className='btn' style={{backgroundColor:'#198754',color:'white'}}>Login</button>
            </div>

            <div style={{color:'rgba(255,255,255,0.87'}}>
                Do not have an Account? <Link style={{color:'#198754',textDecoration:'none'}} to={'/signup'}>Sign Up</Link>
            </div>
        </div>
    );
}

export default Login;
