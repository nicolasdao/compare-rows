# compare-rows

CLI tool to compare rows/lines between two files. Offers the option to print the results in the terminal or save the in local files.

```
npx compare-rows ./file01.txt ./file02.txt
```

Example:

`file01.txt`
```
apple
orange
pear
melon  
```
> Notice that melon contains two trailing spaces. It's not `melon`, it is `melon  `.


`file02.txt`
```
banana
pinneaple
apple
strawberry
melon
Orange
```

```
npx compare-rows ./file01.txt ./file02.txt
```

Results:
```
✔ COMMON ROWS:
[ 'apple' ]

✔ DIFFERENT ROWS IN FILE ./file01.txt:
[ 'melon  ', 'orange', 'pear' ]

✔ DIFFERENT ROWS IN FILE ./file02.txt:
[ 'Orange', 'banana', 'melon', 'pinneaple', 'strawberry' ]
```

To use case insensitive comparison, use the `-i` option:

```
npx compare-rows -i ./file01.txt ./file02.txt
```

Results:
```
✔ COMMON ROWS:
[ 'apple', 'orange' ]

✔ DIFFERENT ROWS IN FILE ./file01.txt:
[ 'melon  ', 'pear' ]

✔ DIFFERENT ROWS IN FILE ./file02.txt:
[ 'banana', 'melon', 'pinneaple', 'strawberry' ]
```

To ignore leading and trailing spaces in the comparison, use the `-t` option:

```
npx compare-rows -t ./file01.txt ./file02.txt
```

Results:
```
✔ COMMON ROWS:
[ 'apple', 'melon' ]

✔ DIFFERENT ROWS IN FILE ./file01.txt:
[ 'orange', 'pear' ]

✔ DIFFERENT ROWS IN FILE ./file02.txt:
[ 'Orange', 'banana', 'pinneaple', 'strawberry' ]
```

To mix both options, use:

```
npx compare-rows -t -i ./file01.txt ./file02.txt
```
or
```
npx compare-rows -it ./file01.txt ./file02.txt
```

Results:
```
✔ COMMON ROWS:
[ 'apple', 'melon', 'orange' ]

✔ DIFFERENT ROWS IN FILE ./file01.txt:
[ 'pear' ]

✔ DIFFERENT ROWS IN FILE ./file02.txt:
[ 'banana', 'pinneaple', 'strawberry' ]
```

# License

BSD 3-Clause License