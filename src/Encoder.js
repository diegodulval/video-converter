import React, { Fragment, Component } from "react";
import toastr from "toastr";
import "./Encoder.scss";
import Progress from "./Progress";

export default class Encoder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: props.file,
      encoded_file: "",
      convert_ext: props.convert_ext,
      progress: 0,
      eta: ""
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.props.newEncode();
  }

  render() {
    let filename = this.state.file;
    return (
      <div className="encoder">
        <h3>
          {filename.substring(filename.indexOf("_") + 1)} <br />
          <small>
            ETA :
            {this.state.eta.trim().length ? this.state.eta : "calculating ... "}
          </small>
        </h3>
        <Progress title="" progress={this.state.progress} />

        {this.state.encoded_file ? (
          <div>
            <a href={"/encoded/" + this.state.encoded_file} download>
              <button>Download</button>
            </a>
            <button onClick={this.props.newEncode}>New Upload</button>
          </div>
        ) : (
          <button onClick={this.props.newEncode}>Cancel Encoding</button>
        )}
      </div>
    );
  }
}
