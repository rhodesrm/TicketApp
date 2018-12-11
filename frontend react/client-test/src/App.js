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
                <img className='eventimage' alt='' src={Data.images[0].url}>
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
                  {Data.priceRanges ?
                    <div>
                      <td>${Data.priceRanges[0].min} - ${Data.priceRanges[0].max}</td>
                    </div> : <td> <center> Unable to find prices </center> </td>
                  }
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
  constructor () {
    super()
    this.state = {otherData: {}, userData: {}}
  }

  componentDidMount() {

  fetch('/spotifyuser')
    .then(res => res.json())
    .then(userData => this.setState({userData}));

    fetch('/ticketmaster')
      .then(response => response.json())
      .then(otherData => this.setState( {otherData} ));
  }

  render() {
    return (
      <div className="Parse">
      {console.log(this.state.userData)}
      {this.state.userData.display_name ?
        <div>
        {this.state.otherData._embedded ?
          <div>
            <center>
            <h1> Welcome {this.state.userData.display_name}! </h1>
            {this.state.otherData._embedded.events.map(event =>
              <ParseDisplay event={event}/>)}
            </center>
          </div> : <center> <h1> No Ticketmaster Data </h1> </center>
        }
        </div> :  <center> <button onClick={() => window.location='http://localhost:3001/login'}
          style={{padding: '20px', 'fontSize': '50px', 'marginTop': '20px'}}> Sign in with Spotify </button> </center>
      }
      </div>
    );
  }
}

export default App;