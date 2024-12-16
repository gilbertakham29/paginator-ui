import { useState } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons

import "./App.css";
import Table from "./components/Table";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Table />
      </div>
    </>
  );
}

export default App;
