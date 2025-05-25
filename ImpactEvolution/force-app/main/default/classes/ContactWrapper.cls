public with sharing class ContactWrapper {
    @AuraEnabled public Id contactId { get; set; }
    @AuraEnabled public String name { get; set; }
    @AuraEnabled public Decimal totalAmount { get; set; }
    @AuraEnabled public Date mostRecentDate { get; set; }
    @AuraEnabled public List<Payment__c> payments { get; set; }
    @AuraEnabled public String projectName { get; set; }

    public ContactWrapper(Id contactId, String name, Decimal totalAmount, Date mostRecentDate, List<Payment__c> payments) {
        this.contactId = contactId;
        this.name = name;
        this.totalAmount = totalAmount;
        this.mostRecentDate = mostRecentDate;
        this.payments = payments;
    }
}
