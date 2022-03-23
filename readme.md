# identicon

Silly little tool to reverse-map Github identicons to user accounts.

Built by inspecting [dgraham/identicon][dgraham] and [stewartlord/identicon.js][identicon.js], and just doing the reverse of what they're doing.

### How does it work?

Here's how the original algorithm generates the graphic:

1. It hashes the user id. (The string version of it! Not the integer.)

2. Then [nibbles][bit-nibbler] the first 8 chunks of the hash digest in 4 bit increments. A chunk is 8 bits, so 8 chunks produce 16 nibbles.

3. It uses the parity bit of each nibble (aka is it even or odd?) to decide whether a particular pixel in the 5x5 avatar is filled in or not. It starts with the middle column and moves outwards, from top to bottom. The 1st and the 2nd column are reflected along the 3rd column, so it's actually only using 3×5 nibbles.

    Assuming a digest of the form `AB CD EF GH IJ KL MN OP`, it paints pixels in the following order:

    ```
          start
          ▼
    K  F  A  F′ K′
    L  G  B  G′ L′
    M  H  C  H′ M′
    N  I  D  I′ N′
    O  J  E  J′ O′
    ▲
    end
    ```

    The `P` nibble is unused. `F′` to `O′` are just mirrors of their non-prime values.

4. It also does some rgb/hsl math with the lower 28 bits of the digest to choose a colour for the pixels, but I didn't bother learning how that works. Maybe you can figure it out and add support.

And so this program just implements the reverse of that. It computes the md5 for every number and checks that against the user-supplied bit string. The bit string is represented as a html grid, and converted to a digest pattern at compute time.

Read the Python code, it's easier to follow: [`identicon.py`](./python/identicon.py). (I was originally going to use Pyodide for this, but that didn't really work out. The code is still there just in case.)

##### Here's an example.

This walks through searching for a user id that yields the middle avatar from [Jason's blog post][jason].

Assuming 0s represent pixels that are filled in and 1s represent pixels that aren't, the initial grid is:

```
1 0 0 0 1
0 0 0 0 0
0 1 1 1 0
1 0 0 0 1
0 0 1 0 0
```

or, since we only care about the first 3 columns:

```
1 0 0
0 0 0
0 1 1
1 0 0
0 0 1
```

Loosely, this means we're seeking a digest of the form `00 10 10 01 00 10 01 0-`, following the `A` to `O` example from above.

Specifically, however, it means that we're seeking integers with MD5
digests whose 8 most significant chunks resemble the following, in binary:

```
xxx0xxx0
xxx1xxx0
xxx1xxx0
xxx0xxx1
xxx0xxx0
xxx1xxx0
xxx0xxx1
xxx0xxxx
```

We only care about the parity bit for each nibble, so the `x`s can be anything.

###### And now taking the number 2013 as an example:

```python3
>>> import hashlib
>>> h = hashlib.md5(b"2013")
>>> for byte in h.digest()[:8]:
...     print(format(byte, "08b")) # pad to 8 bits
10000000
00111000
11011010
10001001
11100100
10011010
11000101
11101010
```

The output matches the pattern from above! So theoretically, the account with
an id of 2013 should have a robot as its default avatar. And it does: [jeffsmith.png][jeffsmith.png]! (the username mapping happens [here][api])

### Important links

- https://github.blog/2013-08-14-identicons/
- https://github.com/dgraham/identicon
- https://github.com/stewartlord/identicon.js
- https://api.github.com/user/8116382
- https://api.github.com/users/kashav
- https://github.com/identicons/kashav.png


[jason]:  https://github.blog/2013-08-14-identicons/
[dgraham]: https://github.com/dgraham/identicon
[identicon.js]: https://github.com/stewartlord/identicon.js

[jeffsmith.png]: https://github.com/identicons/jeffsmith.png
[api]: https://api.github.com/user/2013

[bit-nibbler]: https://en.wikipedia.org/wiki/Bit_nibbler
