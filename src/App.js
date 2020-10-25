import React from "react";
import "./styles.scss";

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

const timestyle = {
  color: "white"
};

export default class MyClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brklength: 5,
      seslength: 25,
      runstate: "stopped",
      lengthtype: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: timestyle
    };
    this.timerControl = this.timerControl.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.warning = this.warning.bind(this);
    this.buzzer = this.buzzer.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clockify = this.clockify.bind(this);
    this.reset = this.reset.bind(this);
  }

  incrementbrk = () => {
    if (this.state.runstate === "running") {
      return;
    }

    this.state.brklength < 60
      ? this.setState({
          brklength: this.state.brklength + 1
        })
      : this.setState({
          brklength: this.state.brklength
        });
  };
  decrementbrk = () => {
    if (this.state.runstate === "running") {
      return;
    }
    this.state.brklength > 1
      ? this.setState({
          brklength: this.state.brklength - 1
        })
      : this.setState({
          brklength: this.state.brklength
        });
  };
  incrementses = () => {
    if (this.state.runstate === "running") {
      return;
    }
    this.state.seslength < 60
      ? this.setState({
          seslength: this.state.seslength + 1,
          timer: (this.state.seslength + 1) * 60
        })
      : this.setState({
          seslength: this.state.seslength
        });
  };
  decrementses = () => {
    if (this.state.runstate === "running") {
      return;
    }
    this.state.seslength > 1
      ? this.setState({
          seslength: this.state.seslength - 1,
          timer: (this.state.seslength - 1) * 60
        })
      : this.setState({
          seslength: this.state.seslength
        });
  };

  timerControl = () => {
    if (this.state.runstate === "stopped") {
      this.beginCountDown();
      this.setState({ runstate: "running" });
    } else {
      this.setState({ runstate: "stopped" });
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
    }
  };
  reset = () => {
    this.setState({
      brklength: 5,
      seslength: 25,
      runstate: "stopped",
      lengthtype: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: { color: "white" }
    });
    if (this.state.intervalID) {
      this.state.intervalID.cancel();
    }
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  };

  clockify = () => {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + ":" + seconds;
  };

  warning(_timer) {
    if (_timer < 61) {
      this.setState({ alarmColor: { color: "#a50d0d" } });
    } else {
      this.setState({ alarmColor: { color: "white" } });
    }
  }

  buzzer(_timer) {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  }

  beginCountDown = () => {
    this.setState({
      intervalID: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000)
    });
  };

  decrementTimer = () => {
    this.setState({ timer: this.state.timer - 1 });
  };

  phaseControl = () => {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
      if (this.state.lengthtype === "Session") {
        this.beginCountDown();
        this.switchTimer(this.state.brklength * 60, "Break");
      } else {
        this.beginCountDown();
        this.switchTimer(this.state.seslength * 60, "Session");
      }
    }
  };

  switchTimer(num, str) {
    this.setState({
      timer: num,
      lengthtype: str,
      alarmColor: { color: "white" }
    });
  }

  render() {
    return (
      <div id="full-page">
        <h1 className="title">25 + 5 Clock</h1>
        <MyLength
          lengthtype={this.state.lengthtype}
          seslength={this.state.seslength}
          brklength={this.state.brklength}
          decrementbrk={this.decrementbrk}
          incrementbrk={this.incrementbrk}
          decrementses={this.decrementses}
          incrementses={this.incrementses}
        />
        <div className="timewrapper">
          <h1>{this.state.lengthtype}</h1>
          <div id="time-left" style={this.state.alarmColor}>
            {this.clockify()}
          </div>
        </div>

        <div id="controls">
          <i className="fa fa-play fa-2x" onClick={this.timerControl}></i>
          <i className="fa fa-pause fa-2x" onClick={this.timerControl}></i>
          <i className="fa fa-sync fa-2x" onClick={this.reset}></i>
        </div>
        <p className="name">
          Designed by{" "}
          <a
            href="https://github.com/mar-code"
            target="_blank"
            rel="noreferrer"
          >
            <span>Marcus</span>
          </a>
        </p>
        <audio
          id="beep"
          preload="auto"
          ref={(audio) => {
            this.audioBeep = audio;
          }}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />
      </div>
    );
  }
}

class MyLength extends React.Component {
  render() {
    return (
      <div className="length-box">
        <div>
          <h2>Break Length</h2>
          <p>
            <i
              className="fa fa-arrow-down"
              onClick={this.props.decrementbrk}
            ></i>
            {this.props.brklength}
            <i className="fa fa-arrow-up" onClick={this.props.incrementbrk}></i>
          </p>
        </div>
        <div>
          <h2>Session Length</h2>
          <p>
            <i
              className="fa fa-arrow-down"
              onClick={this.props.decrementses}
            ></i>
            {this.props.seslength}
            <i className="fa fa-arrow-up" onClick={this.props.incrementses}></i>
          </p>
        </div>
      </div>
    );
  }
}
