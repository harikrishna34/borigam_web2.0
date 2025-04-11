import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import Settings from "./settings";

const ErrorHandling = () => {
    return(
        <div>
            <ErrorBoundary>
                <Settings />
            </ErrorBoundary>
        </div>
    )
}

export default ErrorHandling;
