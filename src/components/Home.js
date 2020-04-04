import React from 'react';
import { Redirect } from 'react-router-dom';
import './styles/Home.css';

export default class Home extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            code: '',
            redirect: false,
            nickname: '',
            createFormMargin: '-200vh',
            joinFormMargin: '-200vh',
            notificationOpacity: 0,
            notificationBody: 'Fuck You'
        }
    }

    componentDidMount() {
        this.props.socket.on('room-created', (key, nickname) => {
            this.setState({code: key, nickname}, () => this.setState({redirect: true}));
        });

        this.props.socket.on('joined', (key, nickname) => {
            this.setState({code: key, nickname}, () => this.setState({redirect: true}));
        });

        this.props.socket.on('error-caused', () => {
            alert('Key does not match any room, double check it please!');
        })
    }

    form_submit = (e) => {
        e.preventDefault();
        const code = document.getElementById('code').value;
        const nickname = document.getElementById('nickname').value;
        if(!code.includes(' ') && code.length > 4 && nickname.length > 4) {
            this.props.socket.emit('join-room', nickname, code);
        } else {
            this.show_notification('Your nickname should not contain space, and the length should be greater than 4');
        }
    }

    form_submit_1 = (e) => {
        e.preventDefault();
        const nickname = document.getElementById('nickname1').value;
        if(nickname.length > 4) {
            this.props.socket.emit('new-room', nickname)
        } else {
            this.show_notification('Your nickname should not contain space, and the length should be greater than 4');
        }
    }

    show_notification = (msg) => {
        this.setState({notificationOpacity: 1, notificationBody: msg});
        this.hide_notification();
    }

    hide_notification = () => {
        setTimeout(() => this.setState({notificationOpacity: 0}), 3500);
        setTimeout(() => this.setState({notificationBody: ''}), 4000);
    }

    hide_notification_on_click = () => {
        this.setState({notificationOpacity: 0});
        setTimeout(() => this.setState({notificationBody: ''}), 500);
    }

    render() {
        if(this.state.redirect)
            return <Redirect to={`/game/${this.state.nickname}/${this.state.code}`} />
        return (
            <div>
                <div className="notification" style={{opacity: this.state.notificationOpacity, maxWidth: 300}}>
                    <i onClick={() => this.hide_notification_on_click()} className="fas fa-times" style={{color: '#3e3e3e', fontSize: 20, float: "right", cursor: 'pointer'}}></i>
                    <h3>{this.state.notificationBody}</h3>
                </div>
                <div style={{marginTop: this.state.createFormMargin}} className="create_room_div">
                    <div style={{textAlign: 'right', width: '96vw', marginLeft: '2vw', marginBottom: 40, marginTop: 10}}>
                        <i className="fas fa-times" style={{fontSize: 30, color: "white", cursor: 'pointer'}} onClick={() => this.setState({createFormMargin: '-200vh'})}></i>
                    </div>
                    <form onSubmit={this.form_submit_1} style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', width: '80vw', margin: 'auto'}}>
                        <h3 style={{textAlign: 'left'}} className="unselectable">Nickname:</h3>
                        <input id="nickname1" type="text" className="form_input" />
                        <button className="form_btn unselectable">Create</button>
                    </form>
                </div>
                <div style={{marginTop: this.state.joinFormMargin}} className="create_room_div">
                    <div style={{textAlign: 'right', width: '96vw', marginLeft: '2vw', marginBottom: 40, marginTop: 10}}>
                        <i className="fas fa-times" style={{fontSize: 30, color: "white", cursor: 'pointer'}} onClick={() => this.setState({joinFormMargin: '-200vh'})}></i>
                    </div>
                    <form onSubmit={this.form_submit} style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', width: '80vw', margin: 'auto'}}>
                        <h3 className="unselectable" style={{textAlign: 'left'}}>Nickname:</h3>
                        <input id="nickname" type="text" className="form_input" />
                        <br />
                        <h3 className="unselectable" style={{textAlign: 'left'}}>Code:</h3>
                        <input id="code" type="text" className="form_input" />
                        <button className="form_btn">Join</button>
                    </form>
                </div>
                <div className="home">
                    <div className="section-a">
                        <h1 className="unselectable">Create Room</h1>
                        <button type="submit" className="gray_shadow" onClick={() => {
                            this.setState({createFormMargin: "0vh"});
                            document.getElementById('nickname1').focus();
                        }}>Create</button>
                    </div>
                    <div className="section-b">
                        <h1 className="unselectable">Join Room</h1>
                        <button className="black_shadow" type="submit" onClick={() => {
                            this.setState({joinFormMargin: '0vh'});
                            document.getElementById('nickname').focus();
                        }}>Join Room</button>
                    </div>
                </div> 
            </div> 
        )
    }
}
