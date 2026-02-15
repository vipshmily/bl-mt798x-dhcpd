#!/bin/bash

# 设置输入和输出文件夹路径
# 默认生成 GPT 二进制
input_folder="./mt798x_gpt"
# SHOW=1 时用于解析 GPT 二进制
input_folder_show="./mt798x_gpt_bin"
output_folder="./output_gpt"

# 读取VERSION环境变量，默认为2024
# 实际几个 ATF 版本在 GPT 工具上无区别
VERSION=${VERSION:-2024}

if [ "$VERSION" = "2022" ]; then
    tools_folder="./atf-20220606-637ba581b/tools/dev/gpt_editor"
elif [ "$VERSION" = "2023" ]; then
    tools_folder="./atf-20231013-0ea67d76a/tools/dev/gpt_editor"
elif [ "$VERSION" = "2024" ]; then
    tools_folder="./atf-20240117-bacca82a8/tools/dev/gpt_editor"
elif [ "$VERSION" = "2025" ]; then
    tools_folder="./atf-20250711/tools/dev/gpt_editor"
else
    echo "Error: Unsupported VERSION. Please specify VERSION=2022/2023/2024/2025."
    exit 1
fi

# Check if Python is installed on the system
echo "Trying python2.7..."
command -v python2.7
[ "$?" != "0" ] && { echo "Error: Python2.7 is not installed on this system."; exit 0; }

echo "Using GPT tools from: $tools_folder"

# 确保输出文件夹存在，不存在则创建
mkdir -p "$output_folder"

if [ "$SHOW" = "1" ]; then
    # 遍历输入文件夹中的所有 bin/img 文件
    for bin_file in "$input_folder_show"/*.bin "$input_folder_show"/*.img; do
        # 如果文件不存在，跳过
        [ -e "$bin_file" ] || continue

        # 提取文件名（不包含路径和扩展名）
        filename=$(basename -- "$bin_file")
        filename_no_extension="${filename%.*}"

        # 构建输出文本文件路径
        output_file="$output_folder/${filename_no_extension}_gptinfo.txt"

        echo
        echo "=============================="
        echo
        echo "正在处理: $filename"
        echo
        echo "=============================="
        echo

        # 执行 Python 命令获取 gpt 信息，并写入输出文本
        python2.7 "$tools_folder/mtk_gpt.py" --show "$bin_file" > "$output_file"

        if [ $? -eq 0 ]; then
            echo "处理完成: $filename，信息已写入：$output_file"
        else
            echo "处理失败: $filename"
        fi

        echo
        echo "=============================="
        echo
    done

    echo "所有文件处理完成"
else
    # 遍历输入文件夹中的所有json文件
    for json_file in "$input_folder"/*.json; do
        # 提取文件名（不包含路径和扩展名）
        filename=$(basename -- "$json_file")
        filename_no_extension="${filename%.*}"

        # 构建输出文件路径
        output_file="$output_folder/gpt-$filename_no_extension.bin"
        output_file_sdmmc="$output_folder/gpt-$filename_no_extension.sdmmc.bin"

        echo
        echo "=============================="
        echo
        echo "正在处理: $filename"
        echo
        echo "=============================="
        echo

        # 执行Python命令
        if [ "$SDMMC" = "1" ]; then
            python2.7 "$tools_folder/mtk_gpt.py" --i "$json_file" --o "$output_file_sdmmc" --sdmmc
        else
            python2.7 "$tools_folder/mtk_gpt.py" --i "$json_file" --o "$output_file"
        fi

        # 输出执行结果
        echo
        echo "=============================="
        echo
        echo "转换完成: $filename"
        echo
        echo "=============================="
        echo
    done

    echo "所有文件转换完成"
fi