import { Component } from "react";
import ErrorPage from "./ErrorPage";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("The app encountered an unexpected rendering error.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          onRetry={() => window.location.reload()}
          onHome={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
