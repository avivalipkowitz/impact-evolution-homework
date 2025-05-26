import { LightningElement, wire, track } from 'lwc';
import getDonorsWithPayments from '@salesforce/apex/DonorPaymentsController.getDonorsWithPayments';

export default class Donations extends LightningElement {
    @track donors;
    @track error;

    columns = [
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency', editable: true},
        { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date', editable: true },
        { label: 'Project Name', fieldName: 'projectName', type: 'text' }
    ];

    @wire(getDonorsWithPayments)
    wiredDonors({ error, data }) {
        if (data) {
            this.donors = data.map(donor => ({
                ...donor,
                payments: donor.payments.map(payment => ({
                    ...payment,
                    projectName: payment.Project__r?.Name || '—'
                }))
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.donors = undefined;
        }
    }
}
