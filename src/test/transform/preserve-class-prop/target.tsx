export { Component }

function Component() {
  return (
    <>
      <div
        data-styledeck-class="foo bar"
        styleDeck={{
          color: 'red',
        }}
      />
      <div className="foo bar" />
    </>
  )
}
