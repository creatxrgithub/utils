#!/usr/bin/env sh



### "Bourne Shell"
### https://www.grymoire.com/Unix/Bourne.html
### https://www.ooblick.com/text/sh/



YOUR_USER_NAME='crea'
#while [[ ! ${YOUR_USER_NAME} =~ ^[0-9A-Za-z\_\-]{5,32}$ ]]; do # cannot run on sh, it's for bash. 
#while [ "$(echo ${YOUR_USER_NAME} | grep -E '^[0-9A-Za-z\_\-]{5,32}$')" = '' ]; do # to compare strings must use double quotes "${var}"
while [ -z "$(echo ${YOUR_USER_NAME} | grep -E '^[0-9A-Za-z\_\-]{5,32}$')" ]; do #比較字符串要把輸出的匹配用雙引號括起來
	read -p "input your user name : " YOUR_USER_NAME
done
echo 'finished........'
echo ${YOUR_USER_NAME}




### for sh

# -e filename
#     True if filename exists.
# -d filename
#     True if filename exists and is a directory.
# -f filename
#     True if filename exists and is a plain file.
# -h filename
#     True if filename exists and is a symbolic link.
# -r filename
#     True if filename exists and is readable.
# -w filename
#     True if filename exists and is writable.
# -n string
#     True if the length of string is non-zero.
# -z string
#     True if the length of string is zero.
# string
#     True if string is not the empty string.
# s1 = s2
#     True if the strings s1 and s2 are identical.
# s1 != s2
#     True if the strings s1 and s2 are not identical.
# n1 -eq n2
#     True if the numbers n1 and n2 are equal.
# n1 -ne n2
#     True if the numbers n1 and n2 are not equal.
# n1 -gt n2
#     True if the number n1 is greater than n2.
# n1 -ge n2
#     True if the number n1 is greater than or equal to n2.
# n1 -lt n2
#     True if the number n1 is less than n2.
# n1 -le n2
#     True if the number n1 is less than or equal to n2.
# ! expression
#     Negates expression, that is, returns true iff expression is false.
# expr1 -a expr2
#     True if both expressions, expr1 and expr2 are true.
# expr1 -o expr2
#     True if either expression, expr1 or expr2 is true.
# ( expression )
#     True if expression is true. This allows one to nest expressions. 





### for bash

### https://linuxize.com/post/how-to-compare-strings-in-bash/

# Comparison Operators

# Comparison operators are operators that compare values and return true or false. When comparing strings in Bash you can use the following operators:

#     string1 = string2 and string1 == string2 - The equality operator returns true if the operands are equal.
#         Use the = operator with the test [ command.
#         Use the == operator with the [[ command for pattern matching.
#     string1 != string2 - The inequality operator returns true if the operands are not equal.
#     string1 =~ regex- The regex operator returns true if the left operand matches the extended regular expression on the right.
#     string1 > string2 - The greater than operator returns true if the left operand is greater than the right sorted by lexicographical (alphabetical) order.
#     string1 < string2 - The less than operator returns true if the right operand is greater than the right sorted by lexicographical (alphabetical) order.
#     -z string - True if the string length is zero.
#     -n string - True if the string length is non-zero.

# Following are a few points to be noted when comparing strings:

#     A blank space must be used between the binary operator and the operands.
#     Always use double quotes around the variable names to avoid any word splitting or globbing issues.
#     Bash does not segregate variables by “type”, variables are treated as integer or string depending on the context.
