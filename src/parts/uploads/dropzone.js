import React from 'react';
import propTypes from 'prop-types';
import ReactDropzone from 'react-dropzone';

const Dropzone = (props) => {
    const { className, ...ReactDropzoneProps } = props;

    return (
        <ReactDropzone
            {...ReactDropzoneProps}
        >
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className })}>
                    <input {...getInputProps()} />
                    {props.children}
                </div>
            )}
        </ReactDropzone>
    );
};

Dropzone.propTypes = {
    className: propTypes.string,
    children: propTypes.object
}

export default Dropzone;
