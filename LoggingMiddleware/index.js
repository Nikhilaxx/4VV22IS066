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

const shortUrls={}
app.post('/shorturls',(req,res)=>{
  const{url,validity,shortcode}=req.body
  

  let code=shortcode
  if(shortUrls[code]){
    return res.status(409).json({error:'Shortcode already exists'})
  }

  const now=new Date()
  const expiresAt=new Date(now.getTime()+(validity||30)*60000)

  shortUrls[code]={
    originalUrl:url,
    createdAt:now,
    expiresAt,
  }

  res.json({
    shortLink:`http://localhost:${PORT}/${code}`,
    expiresAt:expiresAt.toISOString()
  })
})

app.get('/:shortcode',(req,res)=>{
  const code=req.params.shortcode
  const data=shortUrls[code]

  if(!data){
    return res.status(404).json({error:'Shortcode not found'})
  }

  if(new Date()>data.expiresAt){
    return res.status(410).json({error:'Short link expired'})
  }
})

app.get('/shorturls/:shortcode',(req,res)=>{
  const code=req.params.shortcode
  const data=shortUrls[code]

  if(!data){
    return res.status(404).json({error:'Shortcode not found'})
  }

  res.json({
    originalUrl:data.originalUrl,
    createdAt:data.createdAt,
    expiresAt:data.expiresAt,
    
  })
})

app.listen(PORT,()=>{
  console.log(`Server running at http://localhost:${PORT}`)
})
