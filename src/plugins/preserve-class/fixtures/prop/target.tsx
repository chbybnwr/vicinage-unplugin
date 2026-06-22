export { Component }

function Component() {
  return (
    <>
      <div
        data-styledeck-class='foo bar'
        data-styledeck
        styleDeck={{
          color: 'red',
        }}
      />
      <div className='foo bar' />
    </>
  )
}
