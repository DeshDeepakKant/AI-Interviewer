import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@mui/material";
function Testing() {
  const [test, setTest] = useState("");
  useEffect(() => {
    axios
      .get("https://backend-ai-interview.vercel.app/api/v1/user/test")
      .then((res) => {
        setTest(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  return (
    <div>
      <br />
      <br />
      <br />
      <h1>Testing</h1>
      {test}
      <Button component={Link} to="/login">
        Loign
      </Button>
    </div>
  );
}

export default Testing;

