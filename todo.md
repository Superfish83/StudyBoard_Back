## TODO

1.  DataBase 관련

-   Studyroom 의 [정보]에 추가할 내용 정하기

    ```
    description = ""
    lessons = [
        {

        }
    ],
    resources: [
        {
            name: "프리드버드 선형대수학",
            resourceUri: ""
        }
    ]
    ```

2.

---

**DB**

-   studyroom

    -   ID (기본키)
    -   이름
    -   설명
    -   [정보] → 어떤 정보를 넣은 것인지 결정 필요

-   관계 테이블

    -   ID (기본키)
    -   회원 ID (외래키)
    -   스터디룸 ID (외래키)
    -   관계 유형
