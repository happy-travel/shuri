import React from 'react';
import propTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
class Modal extends React.Component {
    render() {
        const { title } = this.props;
        return (
            <div className="modal-wrapper">
                <div
                    className="overlay"
                    onClick={this.props.onCloseClick}
                />
                <div className="modal-scroll">
                    <div className="confirm modal">
                        <div
                            className="close-button"
                            onClick={this.props.onCloseClick}
                        >
                            <span className="icon icon-close" />
                        </div>
                        {title ?
                            <h2>{title}</h2> :
                            null
                        }
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    children: propTypes.array,
    title: propTypes.string,
    onCloseClick: propTypes.func
};

export default Modal;
