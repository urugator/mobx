import React, { createContext, StrictMode } from "react"
import { inject, observer, Observer, enableStaticRendering, useStaticRendering } from "../src"
import { render, act } from "@testing-library/react"
import {
    getObserverTree,
    _resetGlobalState,
    action,
    computed,
    observable,
    transaction,
    makeObservable
} from "mobx"
import { withConsole } from "./utils/withConsole"
/**
 *  some test suite is too tedious
 */

afterEach(() => {
    jest.useRealTimers()
})

// let consoleWarnMock: jest.SpyInstance | undefined
// afterEach(() => {
//     consoleWarnMock?.mockRestore()
// })

test("TODO", async () => {
    let renderCount = 0
    const Child = observer(function Child({ children }) {
        renderCount++
        // Accesses Parent's this.props
        return children()
    })

    @observer
    class Parent extends React.Component<any> {
        // intentionally stable, so test breaks when you disable observable props (comment line 239 in observerClass)
        renderChild = () => {
            return this.props.x
        }
        render() {
            // Access observable props as part of child
            return <Child>{this.renderChild}</Child>
        }
    }

    function Root() {
        const [x, setX] = React.useState(0)
        // Send new props to Parent
        return (
            <div onClick={() => setX(x => x + 1)}>
                <Parent x={x} />
            </div>
        )
    }

    // const app = (
    //     <StrictMode>
    //         <Root />
    //     </StrictMode>
    // )

    const app = <Root />

    const { unmount, container } = render(app)

    expect(container).toHaveTextContent("0")
    console.log("After initial render", renderCount) // is 1, because during initial render the Child isn't subscribed yet

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    act(() => {
        console.log("changing state")
        container.querySelector("div")?.click()
    })
    expect(container).toHaveTextContent("1")
    console.log("After state change", renderCount) // is 3, should be 2
    unmount()
})
