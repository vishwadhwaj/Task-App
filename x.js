// Trade off between query performance vs consistency

// Using ReferenceSet(Normalization)--> CONSISTENCY is good
let author = {
  name: 'Mosh',
}

let course = {
  author: 'id',
}

// using Embedded Documents(Denormalization)-->QUERY PERFORMANCE is good
let course = {
  author: {
    name: 'Mosh',
  },
}

// Hybrid approach

let author = {
  name: 'Mosh',
  // 50 other properties
}
