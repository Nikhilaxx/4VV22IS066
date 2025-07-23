const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const http=require('http')

const PORT=3000
app.use(bodyParser.json())

function Log(stack,level,pkg,message){
  const data=JSON.stringify({
    stack,level,package:pkg,message
  })

  const options={
    hostname:'localhost',
    port:9000,
    path:'/logs',
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Content-Length':data.length
    }
  }

  const req=http.request(options,res=>{
    res.on('data',()=>{})
  })

  req.on('error',()=>{})
  req.write(data)
  req.end()
}

app.use((req,res,next)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  Log("backend","info","middleware",`${req.method} ${req.url}`)
  next()
})

