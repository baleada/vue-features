import { portfolio } from '@alexvipond/mulago-foundation-portfolio'

export const interesting = (() => {
  return portfolio.reduce((rows, { name, website, investments }) => {
    rows.push([name, website, investments.length])
    return rows
  }, [] as [string, string, number][])
})()

export const interestingWithColumnHeaders = (() => {
  return portfolio.reduce((rows, { name, website, investments }) => {
    rows.push([name, website, investments.length])
    return rows
  }, [['name', 'website', 'investments']] as (string | number)[][])
})()
