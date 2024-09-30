import { useState } from "react";
import ASLRecorder from "./component";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ASLRecorder />
    </>
  );
}

export default App;
