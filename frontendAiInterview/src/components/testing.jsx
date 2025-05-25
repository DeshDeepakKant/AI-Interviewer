import axios from "axios";
import { useEffect, useState } from "react";

function Testing() {

    const [test, setTest] = useState("")
    useEffect(() => {
        axios.get("https://backend-ai-interview.vercel.app/api/v1/user/test")
        .then((res)=>{
            setTest(res.data)  
        }).catch((err)=>{
            console.log(err)
        })
    })
    return (
        <div>
            <h1>Testing</h1>
            {test}
        </div>
    );
}

export default Testing;