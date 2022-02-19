//to change
const listen = () => {
    dex.events.allEvents()
    .on('data', event => console.log(event.event, event.returnValues))
    .on('changed', changed => console.log(changed))
    .on('error', err => {console.log('errrr'); throw err})
    .on('connected', str => console.log(str))
        
}
listen()