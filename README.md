# impact-evolution-homework

Lightning Web Component to track Payments to Project


If logging into Aviva's dev instance: navigate straight to the app "Donations" and have fun

If starting from scratch in your own dev instance:
- Create custom objects/fields by hand in Salesforce (sorry):
* Project (Project__c):
    * Total_Payments__c (Currency, default 0)
* Payment (Payment__c):
    * Payment_Date__c (Date)
    * Amount__c (Currency)
    * Project__c (Lookup to Project)
    * Contact__c (Lookup to Contact)
* Contact (Standard Object):
    * Total_Payments__c (Currency, default 0)
    * Most_Recent_Payment_Date__c (Date)

Generate sample data: run scripts/apex/createTestData.apex

Create custom LWC in Lightning App Builder (Custom component is called "Donations")




************************
Original assignment:
Data Model/Objects
Create custom objects to model the following relationship: There are Projects to which multiple people can make Payments. Likewise, a person can make payments to multiple projects. Use the standard Contact object for people and custom objects for Payments and Projects. The Project should have a field that shows the total amount of Payments made to it by people. There should be fields on Contact showing the total amount of payments and the most recent payment date that a person has made to projects. There should be a field on Payment to capture payment date.
 
Connect the objects using lookups instead of master-details.
 
Trigger
Write a trigger to populate these payment date and amount fields on Project and Contact. Use lookup relationships and Apex code instead of roll-up summary fields to compute the amounts. The trigger should handle insert, update and delete of Payments, including modification of payment date.
 
Lightning Components
Using the same data model from above, create one or more lightning components that lists all people that have made at least one payment to any Project. For each person, show the total payment amount and the most recent payment date, and list the individual payments that a person has made underneath the summary line. The date and amount fields for each payment should be editable on the page.
The user can use this page to edit payments and see the rollups of total amount and most recent payment date in action. The internal user can also use this page to add and delete new payments for a given person listed on the page – so there should be add, delete functionality per person, and edit per payment row.
All of these fields should have  a field validation that checks the user's input value for validity (date, number) using Javascript - and displays errors before the user attempts to persist the data when editing or creating a record.
 
Please include unit tests like you normally would in actual development projects.

