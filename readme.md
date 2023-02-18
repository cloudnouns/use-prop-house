# use-prop-house

A collection of React Hooks to streamline data retrieval from the [Nouns Prop House API](https://prod.backend.prop.house/graphql).

Some to fetch specific items:

- `useHouse`
- `useRound`
- `useProposal`

And some to fetch groups of items:

- `usePropHouses`
- `useRoundsbyHouse`
- `useRoundsByStatus`
- `useProposalsByRound`
- `useVotesByRound`

## Installation

```bash
# npm
npm i use-prop-house
# yarn
yarn add use-prop-house
```

## Hooks

<details>
<summary><b>useHouse</b></summary>

---

`useHouse` - A hook for fetching a given house.

**Config object**

| key  | value    |
| ---- | -------- |
| `id?` | `number` |
|`contract?` |`string`|

Requires either `id` or `contract`. Priority is given to `id` when both are present.

**Usage**

```js
import { useHouse } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useHouse({
		id: 21, // or
		contract: "0xdf9b7d26c8fc806b1ae6273684556761ff02d422",
	});

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <img src={data.imageUrl} alt="" />
      <a href={data.url}>{data.name}</a>
      <p>{data.description}</p>
      <p>Total proposals: {data.totalProposals}</p>
    </div>
  );
}
```

---

</details>

<details>
<summary><b>useRound</b></summary>

---

`useRound` - A hook for fetching a given funding round.

**Config object**

| key  | value    |
| ---- | -------- |
| `id` | `number` |

**Usage**

```js
import { useRound } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useRound({ id: 21 });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <a href={data?.url}>
        {data?.house.name}: {data?.name}
      </a>
      <p>{data?.description}</p>

      <ul>
        {data?.proposals.map((prop) => {
          return (
            <li key={prop.id}>
              <a href={prop.url}>
                <p>{prop.title}</p>
                <p>{prop.summary}</p>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

---

</details>

<details>
<summary><b>useProposal</b></summary>

---

`useProposal` - A hook for fetching a given proposal.

**Config object**

| key  | value    |
| ---- | -------- |
| `id` | `number` |

**Usage**

```js
import { useProposal } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useProposal({ id: 65 });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <a href={data?.url}>{data?.title}</a>
      <p>Proposed by: {data.proposer}</p>
      <p>{data?.content}</p>
    </div>
  );
}
```

---

</details>

<details>
<summary><b>usePropHouses</b></summary>

---

`usePropHouses` - A hook for fetching summary data for each house.

**Usage**

```js
import { usePropHouses } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = usePropHouses();

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data.map((house) => {
        return (
          <div key={house.id}>
            <img src={house.imageUrl} alt="" />
            <a href={house.url}>{house.name}</a>
            <p>Contract: {house.contract}</p>
          </div>
        );
      })}
    </div>
  );
}
```

---

</details>

<details>
<summary><b>useRoundsbyHouse</b></summary>

---

`useRoundsbyHouse` - A hook for fetching rounds from a given house.

**Config object**

| key       | value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| `houseId` | `number`                                                                |
| `status?` | `string` or `string[]` - values: `upcoming`, `open`, `voting`, `closed` |

**Usage**

```js
import { useRoundsByHouse } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useRoundsByHouse({
    houseId: 1,
    status: ['open', 'voting'], // omit to include all statuses
  });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {data.map((round) => {
        return (
          <div key={round.id}>
            <a href={round?.url}>
              {round?.house.name}: {round?.name}
            </a>
            <p>{round?.description}</p>

            <ul>
              {round?.proposals.map((prop) => {
                return (
                  <li key={prop.id}>
                    <a href={prop.url}>
                      <p>{prop.title}</p>
                      <p>{prop.summary}</p>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}
```

---

</details>

<details>
<summary><b>useRoundsByStatus</b></summary>

---

`useRoundsByStatus` - A hook for fetching rounds by status.

**Config object**

| key       | value                                                     |
| --------- | --------------------------------------------------------- |
| `status`  | `string` - values: `upcoming`, `open`, `voting`, `closed` |
| `limit?`  | `number` - default: `10`                                  |
| `offset?` | `number` - default: `0`                                   |

**Usage**

```js
import { useRoundsByStatus } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useRoundsByStatus({
    status: 'open',
    limit: 5,
    offset: 0,
  });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {data.map((round) => {
        return (
          <div key={round.id}>
            <a href={round?.url}>
              {round?.house.name}: {round?.name}
            </a>
            <p>{round?.description}</p>

            <ul>
              {round?.proposals.map((prop) => {
                return (
                  <li key={prop.id}>
                    <a href={prop.url}>
                      <p>{prop.title}</p>
                      <p>{prop.summary}</p>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}
```

---

</details>

<details>
<summary><b>useProposalsByRound</b></summary>

---

`useProposalsByRound` - A hook for fetching proposals from a given round.

**Config object**

| key       | value    |
| --------- | -------- |
| `roundId` | `number` |

**Usage**

```js
import { useProposalsByRound } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useProposalsByRound({ roundId: 2 });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {data?.map((prop) => {
        return (
          <div key={prop.id}>
            <a href={prop?.url}>{prop?.title}</a>
            <p>Proposed by: {prop.proposer}</p>
            <p>{prop?.content}</p>
          </div>
        );
      })}
    </>
  );
}
```

---

</details>

<details>
<summary><b>useVotesByRound</b></summary>

---

`useVotesByRound` - A hook for fetching votes from a given round.

**Config object**

| key       | value    |
| --------- | -------- |
| `roundId` | `number` |

**Usage**

```js
import { useVotesByRound } from 'use-prop-house';

export default function App() {
  const { data, error, isLoading } = useVotesByRound({ roundId: 97 });

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {data.map((vote, i) => {
        return (
          <div key={i}>
            <p>Voter: {vote.voter}</p>
            <p>votes: {vote.weight}</p>
            <a href={vote.proposal.url}>prop: {vote.proposal.title}</a>
          </div>
        );
      })}
    </>
  );
}
```

---

</details>
