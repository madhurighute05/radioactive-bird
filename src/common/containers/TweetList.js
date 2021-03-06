import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connectWithGetInitialData } from 'redux-data-ssr';
import mapArgsToProps from '../mapArgsToProps';
import { searchTweets } from '../actions/tweets';
import { CircularProgress } from 'material-ui/Progress';
import Tweet from '../components/Tweet';
import NotIdealState from '../components/NotIdealState';
import SentimentVeryDissatisfied from 'material-ui-icons/SentimentVeryDissatisfied';
import BugReport from 'material-ui-icons/BugReport';
import Title from '../components/Title';

const styles = {
  wrapper: {
    margin: '15px',
  },
  tweet: {
    margin: '0 auto',
  },
  loading: {
    'margin-top': '15px',
    width: '100%',
    'text-align': 'center',
  },
};

export class TweetList extends React.Component {
  static get propTypes() {
    return {
      searchTweets: PropTypes.func.isRequired,
      loading: PropTypes.bool.isRequired,
      tweets: PropTypes.array.isRequired,
      classes: PropTypes.object.isRequired,
      isError: PropTypes.bool,
      error: PropTypes.object,
      match: PropTypes.object.isRequired,
    };
  }

  renderLoading() {
    const { classes } = this.props;
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  renderEmpty() {
    return (
      <NotIdealState
        headline="Empty result"
        subheading="The search you have performed returned empty"
        Icon={SentimentVeryDissatisfied}
      />
    );
  }

  renderError() {
    const { error } = this.props;
    let errorText = 'An error was encountered while performing the search';

    if (error && error.errors && error.errors[0] && error.errors[0].message)
      errorText = error.errors[0].message;

    return (
      <NotIdealState headline="Error" subheading={errorText} Icon={BugReport} />
    );
  }

  render() {
    const { loading, isError, tweets, classes, match } = this.props;
    if (loading) return this.renderLoading();
    if (isError) return this.renderError();
    if (tweets.length === 0) return this.renderEmpty();

    const title = `Radioactive Bird - ${decodeURIComponent(
      (match.params || {}).query || ''
    )}`;

    return (
      <Title title={title}>
        <div className={classes.wrapper}>
          {tweets.map(t => (
            <Tweet key={t['id_str']} className={classes.tweet} tweet={t} />
          ))}
        </div>
      </Title>
    );
  }
}

const getData = ({ match, searchTweets }) => {
  if (!match || !match.params || !match.params.query) return Promise.resolve();
  return searchTweets(match.params.query);
};

const mapStateToProps = state => ({
  loading: state.search.loading,
  isError: state.search.isError,
  error: state.search.error,
  tweets: state.search.result.map(id => state.tweets[id]),
});

const mapDispatchToProps = dispatch => ({
  searchTweets: q => dispatch(searchTweets(q)),
});

export const StyledTweetList = withStyles(styles)(TweetList);
export default connectWithGetInitialData({ getData, mapArgsToProps })(
  mapStateToProps,
  mapDispatchToProps
)(StyledTweetList);
