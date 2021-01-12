const ENDPOINT = "https://leetcode.com/api/problems/algorithms/"
const ENPOINT_LINK = "https://leetcode.com/problems/"

const getRandomProblem = () => {
  fetch(ENDPOINT).then(resp=>resp.json()).then(resp => {
    // extracting questions count and number of questions from total questions.
    let questions = resp.stat_status_pairs

    // check for only free questions.
    questions.filter(question => question.paid_only == false)

    // TODO: check whether question is solved or not

    let questions_count = questions.length

    // choosing a random index from the lot
    let index = Math.floor(Math.random() * questions_count);

    let question = questions[index]
    return {
      id: question.stat.question_id,
      title: question.stat.question__title,
      link: `${ENDPOINT_LINK}${question.stat.question__title_slug}`
    }
  })
  .error(err=> null)
}

module.exports = getRandomProblem;
