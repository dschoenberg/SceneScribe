export default `
  query {
    me {
      username
      user_books {
        date_added
        status_id
        book {
          title
          contributions {
            author {
              name
            }
          }
        }
      }
    }
  }
`;
