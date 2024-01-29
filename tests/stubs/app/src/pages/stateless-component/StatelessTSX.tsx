export default function Stateless () {
  return (
    <div class="flex flex-col max-w-md">
      {new Array(100).fill(0).map((_, index) => (
        <div
          class="p-2 outline-0 ring-0 border-0"
          key={index}
        >
          {index}
        </div>
      ))}
    </div>
  )
}
