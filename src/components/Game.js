import React from 'react';
import './styles/Game.css';

export default class Game extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            gameCode: this.props.match.params.code,
            nickname: this.props.match.params.nickname,
            room: {users: [], currentBlackCard: '', czar: 0},
            myWhiteCards: [],
            gameStarted: false,
            everybodyHasPicked: false,
            myKey: 0,
            unconfirmedPick: '',
            confirmedPick: '',
            hasPicked: false,
            alternativeSocketId: '',
            notificationOpacity: 0,
            notificationBody: ''
        }
    }

    componentWillMount() {
        //User Joined
        this.props.socket.on('user-joined', (nickname) => {
            this.props.socket.emit('get-room-info', this.state.gameCode);
        });

        //Emit get-room-info
        this.props.socket.emit('get-room-info', this.state.gameCode);
        this.props.socket.emit('request-cards');

        //On got-room-info
        this.props.socket.on('got-room-info', (room) => {
            this.setState({room}, () => {
                let isValid = true
                this.state.room.users.forEach((u, i) => {
                    if(!u.hasPicked)
                        isValid = false;
                    if(u.nickname === this.state.nickname)
                        this.setState({myKey: i});
                        console.log(i);
                });
                this.setState({everybodyHasPicked: isValid});
            });
        });

        //On error-get-room-info
        this.props.socket.on('error-get-room-info', () => window.location.href = '/');

        //On User Disconnected
        this.props.socket.on('user-disconnected', () => this.props.socket.emit('get-room-info', this.state.gameCode));

        //On Game Ended
        this.props.socket.on('game-ended', () => {
            alert('Game ended! Admin left.');
            window.location.href = '/';
        });

        //On get-cards
        this.props.socket.on('get-cards', (cards) => this.setState({myWhiteCards: cards}));

        //Someone Picked
        this.props.socket.on('someone-picked', (room) => {
            console.log(room)
            this.setState({room}, () => {
                if(this.state.room.picks.length === this.state.room.users.length - 1) {
                    this.setState({everybodyHasPicked: true});
                }
            });
        });

        //New Round
        this.props.socket.on('new-round', (room, winner) => {
            this.setState({room: room, confirmedPick: '', hasPicked: false, alternativeSocketId: '', everybodyHasPicked: false, unconfirmedPick: ''});
            if(winner !== '') {
                this.show_notification(winner);
            }
            document.querySelectorAll('.alternative').forEach(u => {
                u.style.backgroundColor = 'white';
                u.style.color = '#3e3e3e';
            });
            document.querySelectorAll('.white_card').forEach(c => {
                c.style.background  = "white";
                c.style.color = "#3e3e3e";
            });
        });
    }

    copy_code = () => {
        const span = document.getElementById('span_code');
        span.select();
        span.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.getElementById('copy_btn').innerHTML = 'Code copied!';
        document.getElementById('copy_btn').style.background = '#7bc173';
        setTimeout(() => {
            document.getElementById('copy_btn').innerHTML = 'Copy Code';
            document.getElementById('copy_btn').style.background = '#cf6679';
        }, 5000);
    }

    pick_white_card = (body, e) => {
        if(this.state.room.playing && this.state.myKey !== this.state.room.czar && !this.state.hasPicked) {
            document.querySelectorAll('.white_card').forEach(c => {
                c.style.background  = "white";
                c.style.color = "#3e3e3e";
            });
            document.getElementById("white-card-" + e).style.background  = "#879eb0";
            document.getElementById("white-card-" + e).style.color = "white";
            this.setState({unconfirmedPick: body});
        }
    }

    confirm_selection = () => {
        if(this.state.unconfirmedPick !== '') {
            document.querySelectorAll('.white_card').forEach(c => {
                c.style.background  = "white";
                c.style.color = "#3e3e3e";
            });
            this.setState({confirmedPick: this.state.unconfirmedPick, myWhiteCards: this.state.myWhiteCards.filter(u => u !== this.state.unconfirmedPick), unconfirmedPick: '', hasPicked: true}, () => {
                this.props.socket.emit('player-picked', this.state.gameCode, this.state.confirmedPick);
                if(this.state.myWhiteCards.length === 0) {
                    this.props.socket.emit('request-cards');
                }
            });
        }
    }

    alternative_clicked = (socketId, i) => {
        if(this.state.myKey === this.state.room.czar && this.state.everybodyHasPicked) {
            document.querySelectorAll('.alternative').forEach(u => {
                u.style.backgroundColor = 'white';
                u.style.color = '#3e3e3e';
            });
            document.getElementById('alternative-card-' + i).style.color = "white";
            document.getElementById('alternative-card-' + i).style.background = "#879eb0";
            this.setState({alternativeSocketId: socketId});
        }
    }

    czar_submit_clicked = () => {
        if(this.state.myKey === this.state.room.czar && this.state.everybodyHasPicked && this.state.alternativeSocketId !== '') {
            this.props.socket.emit('round-ended', this.state.gameCode, this.state.alternativeSocketId);
        } 
    }

    show_notification = (winner) => {
        this.setState({notificationOpacity: 1, notificationBody: `${winner} won the last round! The czar now is ${this.state.room.users[this.state.room.czar].nickname}.`});
        this.hide_notification();
    }

    hide_notification = () => {
        setTimeout(() => this.setState({notificationOpacity: 0}), 2500);
        setTimeout(() => this.setState({notificationBody: ''}), 3000);
    }

    hide_notification_on_click = () => {
        this.setState({notificationOpacity: 0});
        setTimeout(() => this.setState({notificationBody: ''}), 500);
    }

    render() {
        const users = this.state.room.users.map((u, i) => (
            <li key={i} style={{background: this.state.nickname === u.nickname ? 'black' : '#3e3e3e'}}><label className="left unselectable">{u.nickname}{u.admin ? '(admin)' : ''}: {u.score}</label><label className="right unselectable">{this.state.room.czar === i ? 'Czar' : 'Player'}</label></li>
        ));
        const myWhiteCards = this.state.myWhiteCards.map((u, i) => (
            <div key={i} id={"white-card-" + i} className="white_card" onClick={(e) => this.pick_white_card(u, i)}>
                <h2 className="unselectable">{u}</h2>
            </div>
        ));
        const alternatives = this.state.room.users.map((u, i) => {
            if(i !== this.state.room.czar) {
                return (
                    <div id={"alternative-card-" + i} key={i} className="white_card alternative" onClick={() => this.alternative_clicked(u.socketId, i)}>
                        <h2 className="unselectable">{this.state.everybodyHasPicked ? u.currentPick : ''}</h2>
                    </div>
                )
            }
            return '';
        });

        return (
            <div className="game">
                <div className="notification" style={{opacity: this.state.notificationOpacity}}>
                    <i onClick={() => this.hide_notification_on_click()} className="fas fa-times" style={{color: '#3e3e3e', fontSize: 20, float: "right", cursor: 'pointer'}}></i>
                    <h3>{this.state.notificationBody}</h3>
                </div>
                <div className="header">
                    <i onClick={() => window.location.href = '/'} className="fas fa-home" style={{color: "white", fontSize: 30, padding: 15, cursor: 'pointer'}}></i>
                </div>
                <div className="body">
                    <div style={{width: "100vw", height: 300, background: 'black', color: 'white', display: 'flex', flexDirection: "column", justifyContent: 'center', textAlign: 'center', paddingTop: 60}}>
                        <h1 className="unselectable">Share the code!</h1>   
                        <input type="text" value={this.state.gameCode} style={{opacity: 0, height: 0}} id="span_code" />
                        <button className="submit_btn" onClick={() => this.copy_code()} id="copy_btn">Copy Code</button>
                    </div>
                    <br />
                    <div className="card_playing" >
                        <div className="black_card">
                            <h2 className="unselectable">{this.state.room.currentBlackCard}</h2>
                        </div>
                        <div className="alternatives">{alternatives}</div>
                    </div>
                    <br />
                    <div id="czar_dashboard" style={{display: this.state.room.czar === this.state.myKey ? 'block' : 'none'}}>
                        <button className="submit_btn" onClick={() => this.czar_submit_clicked()}>Confirm Selection</button>
                    </div>
                    <br />
                    <h1 style={{color: "white", textAlign: 'center'}}>Your cards:</h1>
                    <br />
                    <div className="my_cards">{myWhiteCards}</div>
                    <div id="player_dashboard" style={{display: this.state.room.czar === this.state.myKey ? 'none' : 'block'}}>
                        <br />
                        <button className="submit_btn" onClick={() => this.confirm_selection()}>Submit Pick</button>
                    </div>
                    <br /><br />
                    <ul className="users_list">
                        {users}
                    </ul>
                    <br /><br />
                </div>
            </div>
        )
    }
}