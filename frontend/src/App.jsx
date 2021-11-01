"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("./App.css");
var SymfoniContext_1 = require("./hardhat/SymfoniContext");
var Main_1 = require("./components/Main");
function App() {
    return (<div className="App">
      <header className="App-header">
        <SymfoniContext_1.Symfoni autoInit={true}>
          <Main_1.Main></Main_1.Main>
        </SymfoniContext_1.Symfoni>
      </header>
    </div>);
}
exports.default = App;
