import React, { Component } from 'react';
import './App.css';

class ParseDisplay extends Component {
  render () {
    let Data = this.props.event
    return (
      <div className='ConcertDisplay'>
        <table className="ResultsTable">
          <tr>
            <td className='imagecell'>
              <div className="imgcontainer">
                <center>
                <img className='eventimage' src={Data.images[0].url}>
                </img>
                </center>
              </div> 
            </td>
            <td className="textcell">
              <div> {/* Table Div */}
                <table className="texttable">
                <tr>
                  <td>{Data.name}</td>
                  <td>{Data._embedded.venues[0].name}</td>
                </tr>
                <tr>
                  <td>{Data.dates.start.localDate}</td>
                  <td>${Data.priceRanges[0].min} - ${Data.priceRanges[0].max}</td>
                </tr>
                </table>
              </div>
            </td>
            <td className="buttoncell">
              <div> {/* Button Div */}
                <button><a href={Data.url} target='_blank' rel="noopener noreferrer"> View Event </a> </button>
              </div>
            </td>
          </tr>
        </table>
      </div>
    )
  }
}

class App extends Component {
  state = {users: []}
  constructor () {
    super()
    this.state = {otherData: {}}
  }

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({ users }));

    fetch('/ticketmaster')
      .then(response => response.json())
      .then(otherData => this.setState( {otherData} ));
  }

  render() {
    return (
      <div className="Parse">
      {console.log(this.state.otherData)}
      {this.state.otherData._embedded ?
        <div>
          <center>
          <h1> Concerts </h1>
          {this.state.otherData._embedded.events.map(event =>
            <ParseDisplay event={event}/>)}
          </center>
        </div> : <center> <button onClick={() => window.location='http://localhost:8888/login'}
        style={{padding: '20px', 'fontSize': '50px', 'marginTop': '20px'}}> Sign in with Spotify </button> </center>
      }
      </div>
    );
  }
}

export default App;