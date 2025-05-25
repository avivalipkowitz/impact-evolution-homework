// Create some Contacts
List<Contact> contacts = new List<Contact>{
    new Contact(FirstName='Alice', LastName='Anderson'),
    new Contact(FirstName='Bob', LastName='Baker'),
    new Contact(FirstName='Cara', LastName='Chen')
};
insert contacts;

// Create some Projects
List<Project__c> projects = new List<Project__c>{
    new Project__c(Name='Clean Water Initiative'),
    new Project__c(Name='Food for All Campaign')
};
insert projects;

// Create some Payments linking Contacts to Projects
List<Payment__c> payments = new List<Payment__c>{
    new Payment__c(
        Contact__c = contacts[0].Id,
        Project__c = projects[0].Id,
        Amount__c = 100,
        Payment_Date__c = Date.today().addDays(-10)
    ),
    new Payment__c(
        Contact__c = contacts[0].Id,
        Project__c = projects[1].Id,
        Amount__c = 75,
        Payment_Date__c = Date.today().addDays(-5)
    ),
    new Payment__c(
        Contact__c = contacts[1].Id,
        Project__c = projects[0].Id,
        Amount__c = 150,
        Payment_Date__c = Date.today().addDays(-3)
    ),
    new Payment__c(
        Contact__c = contacts[2].Id,
        Project__c = projects[1].Id,
        Amount__c = 200,
        Payment_Date__c = Date.today()
    )
};
insert payments;

System.debug('✅ Sample data created: ' + payments.size() + ' payments.');
