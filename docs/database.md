# Database Design

-   Person
-   Event
-   Meta

## Person

Properties:

-   id
-   name: It can be either full name or nickname
-   age: It should be classified as
    -   18 ~ 25
    -   26 ~ 30
    -   31 ~ 40
    -   41 ~ 50
    -   51 ~ 60
    -   61
-   gender: Biological sex
    -   male
    -   female
-   interests: Free text
-   friends: List of other people ids
-   teaching Progress:
    -   Lesson 1: boolean
    -   Lesson 2: boolean
    -   Lesson 3: boolean
    -   Lesson 4: boolean
    -   Lesson 5: boolean
-   type: People type
    -   Potential member
    -   New member
    -   Member

### Example

<details><summary>Example</summary>

```json
{
	"id": 123,
	"name": "John",
	"age": 0, // 18 ~ 25
	"gender": 0, // male
	"interests": "cooking, fishing",
	"friends": [100, 12],
	"teachingProgress": {
		"lesson1": true,
		"lesson2": false,
		"lesson3": false,
		"lesson4": false,
		"lesson5": false
	},
	"type": 0 // potential member
}
```

</details>

## Event

-   Id
-   Name
-   Attendance: List of people ids

### Example

<details><summary>Example</summary>

```json
{
	"id": 123,
	"name": "Dinner Party",
	"attendance": [123, 100, 12]
}
```

## Meta
