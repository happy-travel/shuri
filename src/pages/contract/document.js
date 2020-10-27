import React from 'react';
import { action, observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { getContractDocument, removeContractDocument } from 'providers/api';
import DialogModal from '../../parts/dialog-modal';

@observer
class Document extends React.Component {
    @observable downloadedFile;
    @observable isDownloading = false;
    @observable isRemoving = false;
    @observable isRemoveModalShown = false;
    downloadElementRef = React.createRef();

    @action
    clickDownloadLink = () => {
        setTimeout(() => this.downloadElementRef.current.click(), this.clickDownloadLinkSuccess);
        this.isDownloading = false;
    }

    @action
    clickDownloadLinkSuccess = () => {
        this.downloadedFile = undefined;
    }

    @action
    showRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    hideRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    @action
    onDownloadClick = () => {
        this.isDownloading = true;
        getContractDocument({
            urlParams: {
                contractId: this.props.contractId,
                documentId: this.props.document.id
            }
        }).then(this.getContractDocumentSuccess);
    }

    @action
    getContractDocumentSuccess = ({ fileContents, fileDownloadName, contentType }) => {
        const byteCharacters = atob(fileContents);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        this.downloadedFile = {
            url,
            name: fileDownloadName
        };
        this.clickDownloadLink();
    }

    @action
    onRemoveClick = () => {
        this.isRemoving = true;
        removeContractDocument({
            urlParams: {
                contractId: this.props.contractId,
                documentId: this.props.document.id
            }
        }).then(this.removeContractDocumentSuccess);
    }

    @action
    removeContractDocumentSuccess = () => {
        this.isRemoving = false;
        this.props.onRemove();
    }

    render() {
        const { t, document } = this.props;
        return (
            <>
                <div className="document-container">
                    <div
                        className={'document transparent-with-border' + __class(this.isDownloading, 'disabled')}
                        onClick={this.isDownloading ? undefined : () => this.onDownloadClick(document)}
                    >
                        {document.name}
                    </div>
                    <a
                        className="hidden-link"
                        ref={this.downloadElementRef}
                        href={this.downloadedFile?.url}
                        download={this.downloadedFile?.name}
                    />
                    <span
                        className="icon remove"
                        onClick={this.showRemoveModal }
                    />
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing document')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.hideRemoveModal}
                        onYesClick={this.isRemoving ? undefined : this.onRemoveClick}
                    /> :
                    null
                }
            </>
        );
    }
}

Document.propTypes = {
    t: propTypes.func,
    contractId: propTypes.string,
    document: propTypes.object,
    onRemove: propTypes.func
};

export default withTranslation()(Document);
