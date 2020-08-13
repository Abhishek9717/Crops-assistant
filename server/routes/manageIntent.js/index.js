const express = require('express')
const router = express.Router();

router.post('/create-intent',(req,res)=>{
    if(res.statusCode == 200){
        res.send(alert("Intent created successFully!!"));
    }
    
})

router.delete('/delete-intent',(req,res)=>{
    
})


module.exports = router;