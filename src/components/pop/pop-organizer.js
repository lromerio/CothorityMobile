import React from 'react';
import Tappable from 'react-tappable'

import CothorityWS from '../../services/websocket'
import CothorityMessages from '../../lib/cothority-messages'

import './pop-organizer.css'

export default class PopOrganizer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            phase:  0,
            address: '',
            pin: '',
            name: '',
            location:'',
            date: '',
            description: '',
            organizers: '',
            error: ''
        }
    }

    updatePhase(index) {
        this.setState({phase: index})
    }

    //TODO: how do I send a pinRequest?
    contactConode() {
        // Move to next phase
        this.pinPromise = CothorityWS.getStatus(this.state.address)
            .then(() => {this.updatePhase(1)})
            .catch(() => {
                const adr = this.state.address;
                this.setState({
                    error: 'Invalid address: ' + adr,
                    address: ''
                });
                setTimeout(() => {
                    this.setState({
                        error: '',
                    })
                }, 5000)
            });
    }

    /* TODO: send PIN message with www key and PIN to the conode
     * 1) generate keypair
     * 2) send PIN message with www key and PIN
     * 3) update in real time current operation (generating key, sending message, wrong PIN, ..)
     */
    completePairing() {
        // Move to next phase
        this.updatePhase(2);
    }

    //TODO: send StoreConfig message to the server
    storeConfig() {
        // Move to next phase
        this.updatePhase(3);
    }

    //TODO: generate key pair and save it.
    generateKeyPair() {

    }

    renderStartPairing() {
        return (
            <div>
                <h2>Setup Pop Party 1/3</h2>
                <p>
                    Insert the address of a conode and press "Start" in order to
                    begin setting up a PoP party.
                </p>
                    <label className="address_input">
                        Conode Address:
                        <br/>
                        <input value={this.state.address}
                               onChange={(event) => this.setState({address: event.target.value})} />
                    </label>
                <p className="error_message"> {this.state.error}</p>
                <Tappable className="start_button" onTap={() => this.contactConode()}>Start</Tappable>
            </div>
        )
    }

    //TODO: input only digits, done clickable only after generating keys and inserting PIN
    renderCompletePairing() {
        return (
            <div>
                <h2>Setup Pop Party 2/3</h2>
                <p>
                    Generate a pair of keys (public/private) and insert the PIN generated by the conode
                    in order to accomplish the pairing phase.
                </p>
                <label className="pin_input">
                    PIN:
                    <br/>
                    <input type="text" value={this.state.pin}
                           onChange={(event) => this.setState({pin: event.target.value})}/>
                </label>
                <Tappable className="keys_button" onTap={() => this.generateKeyPair()}>
                    Generate Keys
                </Tappable>
                <Tappable className="done_button" onTap={() => this.completePairing()}>
                    Done
                </Tappable>
            </div>
        )
    }

    //TODO: check input, done clickable only if required information have been provided
    renderStoreConfig() {
        return (
            <div>
                <h2>Setup Pop Party 3/3</h2>
                <p>
                    Insert details about the PoP party.
                </p>
                <p>
                <label className="name_input">
                    Name:
                    <br/>
                    <input type="text" value={this.state.name}
                           onChange={(event) => this.setState({name: event.target.value})}/>
                </label>
                </p>
                <p>
                <label className="location_input">
                    Location:
                    <br/>
                    <input type="text" value={this.state.location}
                           onChange={(event) => this.setState({location: event.target.value})}/>
                </label>
                </p>
                <p>
                <label className="date_input">
                    Date:
                    <br/>
                    <input type="text" value={this.state.date}
                           onChange={(event) => this.setState({date: event.target.value})}/>
                </label>
                </p>
                <p>
                <label className="description_input">
                    Description:
                    <br/>
                    <input type="text" value={this.state.description}
                           onChange={(event) => this.setState({description: event.target.value})}/>
                </label>
                </p>
                <p>
                <label className="organizers_input">
                    Other organizers:
                    <br/>
                    <input type="text" value={this.state.organizers}
                           onChange={(event) => this.setState({organizers: event.target.value})}/>
                </label>
                </p>
                <Tappable className="done_button" onTap={() => this.storeConfig()} >
                    Done
                </Tappable>
            </div>
        )
    }

    //TODO: show recap of PoP party details
    renderSetupComplete() {
        return (
            <div>
                <h2>Setup Completed!</h2>
                <table className="pop_party_recap">
                    <tbody>
                    <tr>
                        <th>Name:</th>
                        <td>{this.state.name}</td>
                    </tr>
                    <tr>
                        <th>Location:</th>
                        <td>{this.state.location}</td>
                    </tr>
                    <tr>
                        <th>Date:</th>
                        <td>{this.state.date}</td>
                    </tr>
                    <tr>
                        <th>Description:</th>
                        <td>{this.state.description}</td>
                    </tr>
                    <tr>
                        <th>Other organizers:</th>
                        <td>{this.state.organizers}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        let content = null;
        switch(this.state.phase) {
            case 0:
                content = this.renderStartPairing();
                break;
            case 1:
                content = this.renderCompletePairing();
                break;
            case 2:
                content = this.renderStoreConfig();
                break;
            case 3:
                content = this.renderSetupComplete();
                break;
            default:
                content = this.renderStartPairing();
                break;
        }

        return content;
    }
}