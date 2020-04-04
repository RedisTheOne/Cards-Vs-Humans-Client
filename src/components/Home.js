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
            joinFormMargin: '-200vh'
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
        }
    }

    form_submit_1 = (e) => {
        e.preventDefault();
        const nickname = document.getElementById('nickname1').value;
        if(nickname.length > 4) {
            this.props.socket.emit('new-room', nickname)
        }
    }

    render() {
        if(this.state.redirect)
            return <Redirect to={`/game/${this.state.nickname}/${this.state.code}`} />
        return (
            <div>
                <div style={{marginTop: this.state.createFormMargin}} className="create_room_div">
                    <div style={{textAlign: 'right', width: '96vw', marginLeft: '2vw', marginBottom: 40, marginTop: 10}}>
                        <i className="fas fa-times" style={{fontSize: 30, color: "white", cursor: 'pointer'}} onClick={() => this.setState({createFormMargin: '-200vh'})}></i>
                    </div>
                    <form onSubmit={this.form_submit_1} style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', width: '80vw', margin: 'auto'}}>
                        <h3 style={{textAlign: 'left'}}>Nickname:</h3>
                        <input id="nickname1" type="text" className="form_input" />
                        <button className="form_btn">Create</button>
                    </form>
                </div>
                <div style={{marginTop: this.state.joinFormMargin}} className="create_room_div">
                    <div style={{textAlign: 'right', width: '96vw', marginLeft: '2vw', marginBottom: 40, marginTop: 10}}>
                        <i className="fas fa-times" style={{fontSize: 30, color: "white", cursor: 'pointer'}} onClick={() => this.setState({joinFormMargin: '-200vh'})}></i>
                    </div>
                    <form onSubmit={this.form_submit} style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', width: '80vw', margin: 'auto'}}>
                        <h3 style={{textAlign: 'left'}}>Nickname:</h3>
                        <input id="nickname" type="text" className="form_input" />
                        <br />
                        <h3 style={{textAlign: 'left'}}>Code:</h3>
                        <input id="code" type="text" className="form_input" />
                        <button className="form_btn">Join</button>
                    </form>
                </div>
                <div className="home">
                    <div className="section-a">
                        <h1>Create Room</h1>
                        <button type="submit" className="gray_shadow" onClick={() => {
                            this.setState({createFormMargin: "0vh"});
                            document.getElementById('nickname1').focus();
                        }}>Create</button>
                    </div>
                    <div className="section-b">
                        <h1>Join Room</h1>
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
