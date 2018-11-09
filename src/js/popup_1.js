/*global chrome*/

import React from "react";
import ReactDOM from "react-dom";
import "@material/switch/dist/mdc.switch.css";
import "@material/form-field/dist/mdc.form-field.css";
import {Switch} from "@rmwc/switch";
import "./../scss/popup.scss";


//


console.log(Switch);
class Popup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            komplettChecked: false
        }
    }

    render() {
        return ( <Switch
            checked={this.state.komplettChecked}
            onChange={evt => this.setState({komplettChecked: evt.target.checked})}
            label="Komplettansicht"
        >
        </Switch>)
    }

    componentDidMount() {

        // this.setState({komplettChecked: false});
        // // get state from storage.local
        // chrome.storage.local.get(["config"], function (result) {
        //
        //
        //   const komplettIsActive = result.isKomplettActive;
        //   console.log(komplettIsActive);
        //
        //
        // });

        this.setState({komplettChecked: false});
    }

    componentDidUpdate(prevProps, prevState) {

        console.log(prevState);
    }

}

// Use it
ReactDOM.render(<Popup />, document.getElementById('root'));