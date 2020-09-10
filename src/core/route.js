import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { Route as ReactRoute } from 'react-router-dom';
import tracker from 'matsumoto/src/core/misc/tracker';

const Route = (props) => {
    useEffect(() => {
        document.title = (props.title ? `${props.title} - ` : '') + 'Property Management System';
        tracker();
    });

    return <ReactRoute {...props} />;
};

Route.propTypes = {
    title: propTypes.string
}

export default Route;
