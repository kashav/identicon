import hashlib
import random
import sys


def is_parity_match(c, v):
    return c == "x" or v & 1 == int(c)


def gen(c):
    v = random.getrandbits(4)
    while not is_parity_match(c, v):
        v = random.getrandbits(4)

    return v


def gen_int(pair):
    a, b = pair

    n = gen(a)
    n <<= 4
    n ^= gen(b)

    return n


def gen_matching_bytes():
    if len(sys.argv) != 2:
        sys.exit(1)

    s = sys.argv[1]  # parsed pattern string (not a grid!)

    ints = map(gen_int, s.split(" "))

    for i, n in enumerate(ints):
        print(f"bytes[{i}] = {n};")


def nibble(digest):
    # nibble the first 8 chunks in 4 bit increments, see nibbler.rs
    for byte in digest[:8]:
        hi, lo = byte & 0xF0, byte & 0x0F
        yield hi >> 4
        yield lo


def md5_test(n, pattern):
    b = bytes(str(n), "utf8")
    h = hashlib.md5(b)
    if n == 12789:
        print(n, list(nibble(h.digest())), pattern)
    return all(is_parity_match(c, v) for v, c in zip(nibble(h.digest()), pattern))


def parse_grid(grid):
    """
    converts a grid like

    K F A
    L G B
    M H C
    N I D
    O J E

    to

    ABCDEFGHIJKLMNO
    """

    rows = [row.strip().split(" ") for row in grid]
    return "".join(rows[row][col] for col in range(2, -1, -1) for row in range(0, 5))


def do_all_tests(pattern):
    for i in range(100_000_000):
        if md5_test(i, pattern):
            print(i)


def main():
    grid = """
0 0 1
1 0 0
0 0 1
1 0 1
1 0 1"""

    grid = grid.strip().split("\n")

    # grid = sys.stdin.readlines()  # uncomment this to echo your own grid
    pattern = parse_grid(grid)

    do_all_tests(pattern)


if __name__ == "__main__":
    main()
