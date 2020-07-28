import React from 'react';
import "../Search.css"
import axios from "axios";
import Loader from '../loader.gif'
import PageNavigation from "./PageNavigation"

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: {},
      error: "",
      message: "",
      loading: false,
      totalResults: 0,
      totalPages: 0,
      currentPageNo: 0,
    };
    this.cancel = "";
  }

  getPagesCount = (total, denominator) => {
    const divisible = total % denominator === 0;
    const valueToBeAdded = divisible ? 0 : 1;
    return Math.floor(total / denominator) + valueToBeAdded;
  };

  handleOnInputChange = (event) => {
    const query = event.target.value;
    if (!query) {
      this.setState({
        query,
        results: {},
        totalResults: 0,
        totalPages: 0,
        currentPageNo: 0,
        message: "",
      });
    } else {
      this.setState({ query, loading: true, message: "" }, () => {
        this.fetchSearchResults(1, query);
      });
    }
  };

  handlePageClick = (type, event) => {
    event.preventDefault();
    const updatedPageNo =
      "prev" === type
        ? this.state.currentPageNo - 1
        : this.state.currentPageNo + 1;
    if (!this.state.loading) {
      this.setState({ loading: true, message: "" }, () => {
        this.fetchSearchResults(updatedPageNo, this.state.query);
      });
    }
  };

  fetchSearchResults = (updatedPageNo = "", query) => {
    const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : "";
    const searchUrl = `https://pixabay.com/api/?key=17676645-f845a16a1240069f9646bb5a3&q=${query}${pageNumber}`;
    if (this.cancel) {
      this.cancel.cancel();
    }
    this.cancel = axios.CancelToken.source();
    axios
      .get(searchUrl, {
        cancelToken: this.cancel.token,
      })
      .then((res) => {
        const total = res.data.total;
        const totalPagesCount = this.getPagesCount(total, 20);
        const resultNotFoundMsg = !res.data.hits.length
          ? "There are no more search results. Please try a new search."
          : "";
        this.setState({
          results: res.data.hits,
          totalResults: res.data.total,
          currentPageNo: updatedPageNo,
          totalPages: totalPagesCount,
          message: resultNotFoundMsg,
          loading: false,
        });
      })
      .catch((error) => {
        if (axios.isCancel(error) || error) {
          this.setState({
            loading: false,
            message: "Failed to fetch results.Please check network",
          });
        }
      });
  };

  handleOnInputChange = (event) => {
    const query = event.target.value;
    this.setState({ query, loading: true, message: "" }, () => {
      this.fetchSearchResults(1, query);
      console.log(this.state);
    });
  };

  renderSearchResults = () => {
    const { results } = this.state;
    if (Object.keys(results).length && results.length) {
      return (
        <div className="results-container">
          {results.map((result) => {
            return (
              <a
                key={result.id}
                href={result.previewURL}
                className="result-items"
              >
                <h6 className="image-username">{result.user}</h6>
                <div className="image-wrapper">
                  <img
                    className="image"
                    src={result.previewURL}
                    alt={result.user}
                  />
                </div>
              </a>
            );
          })}
        </div>
      );
    }
  };

  render() {
    const { query, loading, message, currentPageNo, totalPages } = this.state;
    const showPrevLink = 1 < currentPageNo;
    const showNextLink = totalPages > currentPageNo;
    return (
      <div className="container">
        <h2 className="heading">Search</h2>
        <label className="search-label" htmlFor="search-input">
          <input
            type="text"
            name="query"
            value={query}
            id="search-input"
            placeholder="Search..."
            onChange={this.handleOnInputChange}
          />
          <i className="fa fa-search search-icon" />
        </label>
        {message && <p className="message">{message}</p>}
        <img
          src={Loader}
          className={`search-loading ${loading ? "show" : "hide"}`}
          alt="Loader"
        />
        <PageNavigation
          loading={loading}
          showPrevLink={showPrevLink}
          showNextLink={showNextLink}
          handlePrevClick={(event) => this.handlePageClick("prev", event)}
          handleNextClick={(event) => this.handlePageClick("next", event)}
        />
        {this.renderSearchResults()}
        <PageNavigation
          loading={loading}
          showPrevLink={showPrevLink}
          showNextLink={showNextLink}
          handlePrevClick={(event) => this.handlePageClick("prev", event)}
          handleNextClick={(event) => this.handlePageClick("next", event)}
        />
      </div>
    );
  }
}
export default Search;