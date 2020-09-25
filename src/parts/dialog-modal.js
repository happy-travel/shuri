import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import Modal from 'parts/modal';

const DialogModal = (props) => {
    const { t, onNoClick } = props;

    return (
        <Modal
            onCloseClick={onNoClick}
            title={props.title}
        >
            <div className="modal-content">
                <span>{props.text}</span>
                <div className="modal-actions">
                    <button
                        onClick={props.onYesClick}
                        className="button"
                    >
                        {t('Yes')}
                    </button>
                    <button
                        onClick={onNoClick}
                        className="button gray"
                    >
                        {t('No')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

DialogModal.propTypes = {
    t: propTypes.func,
    title: propTypes.string,
    text: propTypes.string,
    onNoClick: propTypes.func,
    onYesClick: propTypes.func
};

export default withTranslation()(DialogModal);
