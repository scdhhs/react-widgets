var React = require('react')
  , Header  = require('./header.jsx')
  , Month = require('./month.jsx')
  , Year = require('./year.jsx')
  , Decade = require('./decade.jsx')
  , Century = require('./century.jsx')
  , cx = require('react/lib/cx')
  , dates = require('../util/dates')
  //, transferProps = require('../util/transferProps')
  , globalize = require('globalize')
  , _ = require('lodash')

var RIGHT = 'right'
  , LEFT  = 'left'
  , MULTIPLIER = {
    'year': 1,
    'decade': 10,
    'century': 100
  },
  VIEW = {
    'month':    Month,
    'year':     Year,
    'decade':   Decade,
    'century':  Century,
  }
  NEXT_VIEW = {
    'month':  'year',
    'year':   'decade',
    'decade': 'century'
  };

module.exports = React.createClass({

  propTypes: {
    culture:      React.PropTypes.array,
    date:         React.PropTypes.instanceOf(Date),
    min:          React.PropTypes.instanceOf(Date),
    max:          React.PropTypes.instanceOf(Date),

    format:       React.PropTypes.string,
    initialView:  React.PropTypes.oneOf(['month', 'year', 'decade']),

    onSelect:     React.PropTypes.func.isRequired
  },

  getInitialState: function(){
    return {
      selectedIndex: 0,
      open:          false,
      view:          this.props.initialView || 'month',
      currentDate:   new Date(this.props.date)
    }
  },

  getDefaultProps: function(){
    return {
      date: new Date,
      min:  new Date(2014,5, 14),
      max:  new Date(2099,11, 31),
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      currentDate: new Date(nextProps.date)
    })
  },

  render: function(){
    var View = VIEW[this.state.view];

    return (
      <div className='rw-calendar rw-widget'>
        <Header
          label={this._label()}
          disabled={this.state.view === 'century'}
          onViewChange={this.nextView}
          onMoveLeft ={_.partial(this.navigate, LEFT)}
          onMoveRight={_.partial(this.navigate, RIGHT)}/>
        <View 
          selected={this.props.date} 
          date={this.state.currentDate}
          onSelect={this.select}
          min={this.props.min}
          max={this.props.max}/>
      </div>
    )
  },

  navigate: function(direction){
    var nextDate = this.nextDate(direction)

    if ( dates.inRange(nextDate, this.props.min, this.props.max))
      this.setState({
        currentDate: nextDate
      })
  },

  select: function(date){
    var view = this.state.view
      , alts = _.invert(NEXT_VIEW);

    if ( view === 'month')
      return this.props.onChange(date)

    this.setState({
      currentDate: date,
      view: alts[view]
    })
  },


  nextView: function(){
    this.setState({
      view: NEXT_VIEW[this.state.view]
    })
  },

  nextDate: function(direction){
    var method = direction === LEFT ? 'subtract' : 'add'
      , view   = this.state.view
      , unit   = view === 'month' ? view : 'year'
      , multi  = MULTIPLIER[view] || 1;

    return dates[method](this.state.currentDate, 1 * multi, unit)
  },

  _label: function(){
    var view = this.state.view
      , dt   = this.state.currentDate;

    if ( view === 'month')
      return globalize.format(dt, dates.formats.MONTH_YEAR)

    else if ( view === 'year')
      return globalize.format(dt, dates.formats.YEAR)

    else if ( view === 'decade')
      return globalize.format(dates.firstOfDecade(dt),     dates.formats.YEAR) 
        + ' - ' + globalize.format(dates.lastOfDecade(dt), dates.formats.YEAR)

    else if ( view === 'century')
      return globalize.format(dates.firstOfCentury(dt),     dates.formats.YEAR) 
        + ' - ' + globalize.format(dates.lastOfCentury(dt), dates.formats.YEAR)
  } 

});
