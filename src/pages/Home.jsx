// import React from "react";

// const Home = () => (
//   <div>
//     <p>fuck lsjdfsldjflskdjflskdjflsdkfjl</p>
//   </div>
// );

// export default Home;
import { auth } from "../firebase/firebase"; // adjust path

function GetToken() {
  const getToken = async () => {ghj
    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }

    const token = await auth.currentUser.getIdToken();
    console.log(token);
  };

  return <button onClick={getToken}>Get Token</button>;
}

export default GetToken;

