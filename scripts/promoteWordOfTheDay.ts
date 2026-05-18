import {promoteDueWordOfTheDay} from '../frontend/sanity/lib/promoteWordOfTheDay'

async function main() {
  const result = await promoteDueWordOfTheDay()
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
